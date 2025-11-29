#include <stdlib.h>
#include <string.h>
#include <stdio.h>
#include <time.h>

#include "http_simple.h"
#include "obfsutil.h"

static char* g_useragent[] = {
    "Python-urllib/3.7",
    "Python-urllib/3.6",
    "Python-urllib/3.5",
    "Python-urllib/3.4",
    "Python-urllib/3.3",
    "Python-urllib/3.2",
    "Python-urllib/3.1",
    "python-requests/2.22.0",
    "python-requests/2.21.0",
    "python-requests/2.20.0",
    "python-requests/2.19.1",
    "okhttp/2.5.0",
    "okhttp/2.7.5",
    "okhttp/3.2.0",
    "okhttp/3.5.0",
    "okhttp/4.1.0",
    "curl/7.54.0",
    "curl/7.55.1",
    "curl/7.64.0",
    "curl/7.64.1",
    "curl/7.65.3",
    "Apache-HttpClient/4.5.2 (Java/1.8.0_151)",
    "Apache-HttpClient/4.5.2 (Java/1.8.0_161)",
    "Apache-HttpClient/4.5.2 (Java/1.8.0_181)",
    "Apache-HttpClient/4.5.3 (Java/1.8.0_121)",
    "Apache-HttpClient/4.5.7 (Java/11.0.3)",
    "Apache-HttpClient/4.5.10 (Java/1.8.0_201)",
    "Go-http-client/1.1",
    "Go-http-client/2.0",
};

static int g_useragent_index = -1;

typedef struct http_simple_local_data {
    int has_sent_header;
    int has_recv_header;
    char *encode_buffer;
}http_simple_local_data;

void http_simple_local_data_init(http_simple_local_data* local) {
    local->has_sent_header = 0;
    local->has_recv_header = 0;
    local->encode_buffer = NULL;

    if (g_useragent_index == -1) {
        g_useragent_index = xorshift128plus() % (sizeof(g_useragent) / sizeof(*g_useragent));
    }
}

obfs * http_simple_new_obfs() {
    obfs * self = new_obfs();
    self->l_data = malloc(sizeof(http_simple_local_data));
    http_simple_local_data_init((http_simple_local_data*)self->l_data);
    return self;
}

void http_simple_dispose(obfs *self) {
    http_simple_local_data *local = (http_simple_local_data*)self->l_data;
    if (local->encode_buffer != NULL) {
        free(local->encode_buffer);
        local->encode_buffer = NULL;
    }
    free(local);
    dispose_obfs(self);
}

char http_simple_hex(char c) {
    if (c < 10) return c + '0';
    return c - 10 + 'a';
}

void http_simple_encode_head(http_simple_local_data *local, char *data, int datalength) {
    if (local->encode_buffer == NULL) {
        local->encode_buffer = (char*)malloc((size_t)(datalength * 3 + 1));
    }
    int pos = 0;
    for (; pos < datalength; ++pos) {
        local->encode_buffer[pos * 3] = '%';
        local->encode_buffer[pos * 3 + 1] = http_simple_hex(((unsigned char)data[pos] >> 4));
        local->encode_buffer[pos * 3 + 2] = http_simple_hex(data[pos] & 0xF);
    }
    local->encode_buffer[pos * 3] = 0;
}

int http_simple_client_encode(obfs *self, char **pencryptdata, int datalength, size_t* capacity) {
    char *encryptdata = *pencryptdata;
    http_simple_local_data *local = (http_simple_local_data*)self->l_data;
    if (local->has_sent_header) {
        return datalength;
    }
    char hosts[1024];
    char * phost[128];
    int host_num = 0;
    int pos;
    char hostport[128];
    int head_size = self->server.head_len + (int)(xorshift128plus() & 0x3F);
    int outlength;
    char * out_buffer = (char*)malloc((size_t)(datalength + 2048));
    char * body_buffer = NULL;
    if (head_size > datalength)
        head_size = datalength;
    http_simple_encode_head(local, encryptdata, head_size);
    if (self->server.param && strlen(self->server.param) == 0)
        self->server.param = NULL;
    strncpy(hosts, self->server.param ? self->server.param : self->server.host, sizeof hosts);
    phost[host_num++] = hosts;
    for (pos = 0; hosts[pos]; ++pos) {
        if (hosts[pos] == ',') {
            phost[host_num++] = &hosts[pos + 1];
            hosts[pos] = 0;
        } else if (hosts[pos] == '#') {
            char * body_pointer = &hosts[pos + 1];
            char * p;
            int trans_char = 0;
            p = body_buffer = (char*)malloc(2048);
            for ( ; *body_pointer; ++body_pointer) {
                if (trans_char) {
                    if (*body_pointer == '\\' ) {
                        *p = '\\';
                    } else if (*body_pointer == 'n' ) {
                        *p = '\r';
                        *++p = '\n';
                    } else {
                        *p = '\\';
                        *++p = *body_pointer;
                    }
                    trans_char = 0;
                } else {
                    if (*body_pointer == '\\') {
                        trans_char = 1;
                        continue;
                    } else if (*body_pointer == '\n') {
                        *p++ = '\r';
                    }
                    *p = *body_pointer;
                }
                ++p;
            }
            *p = 0;
            hosts[pos] = 0;
            break;
        }
    }
    host_num = (int)(xorshift128plus() % (uint64_t)host_num);
    if (self->server.port == 80)
        sprintf(hostport, "%s", phost[host_num]);
    else
        sprintf(hostport, "%s:%d", phost[host_num], self->server.port);
    if (body_buffer) {
        sprintf(out_buffer,
            "GET /%s HTTP/1.1\r\n"
            "Host: %s\r\n"
            "%s\r\n\r\n",
            local->encode_buffer,
            hostport,
            body_buffer);
    } else {
        sprintf(out_buffer,
            "GET /%s HTTP/1.1\r\n"
            "Host: %s\r\n"
            "User-Agent: %s\r\n"
            "Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8\r\n"
            "Accept-Language: en-US,en;q=0.8\r\n"
            "Accept-Encoding: gzip, deflate\r\n"
            "DNT: 1\r\n"
            "Connection: keep-alive\r\n"
            "\r\n",
            local->encode_buffer,
            hostport,
            g_useragent[g_useragent_index]
            );
    }
    //LOGI("http header: %s", out_buffer);
    outlength = (int)strlen(out_buffer);
    memmove(out_buffer + outlength, encryptdata + head_size, datalength - head_size);
    outlength += datalength - head_size;
    local->has_sent_header = 1;
    if ((int)*capacity < outlength) {
        *pencryptdata = (char*)realloc(*pencryptdata, *capacity = (size_t)(outlength * 2));
        encryptdata = *pencryptdata;
    }
    memmove(encryptdata, out_buffer, outlength);
    free(out_buffer);
    if (body_buffer != NULL)
        free(body_buffer);
    if (local->encode_buffer != NULL) {
        free(local->encode_buffer);
        local->encode_buffer = NULL;
    }
    return outlength;
}

int http_simple_client_decode(obfs *self, char **pencryptdata, int datalength, size_t* capacity, int *needsendback) {
    char *encryptdata = *pencryptdata;
    http_simple_local_data *local = (http_simple_local_data*)self->l_data;
    *needsendback = 0;
    if (local->has_recv_header) {
        return datalength;
    }
    char* data_begin = strstr(encryptdata, "\r\n\r\n");
    if (data_begin) {
        int outlength;
        data_begin += 4;
        local->has_recv_header = 1;
        outlength = datalength - (int)(data_begin - encryptdata);
        memmove(encryptdata, data_begin, outlength);
        return outlength;
    } else {
        return 0;
    }
}

void boundary(char result[])
{
    char *str = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    int i,lstr;
    char ss[3] = {0};
    lstr = (int)strlen(str);
    srand((unsigned int)time((time_t *)NULL));
    for(i = 0; i < 32; ++i)
    {
        sprintf(ss, "%c", str[(rand()%lstr)]);
        strcat(result, ss);
    }
}

int http_post_client_encode(obfs *self, char **pencryptdata, int datalength, size_t* capacity) {
    char *encryptdata = *pencryptdata;
    http_simple_local_data *local = (http_simple_local_data*)self->l_data;
    if (local->has_sent_header) {
        return datalength;
    }
    char hosts[1024];
    char * phost[128];
    int host_num = 0;
    int pos;
    char hostport[128];
    int head_size = self->server.head_len + (int)(xorshift128plus() & 0x3F);
    int outlength;
    char * out_buffer = (char*)malloc((size_t)(datalength + 4096));
    char * body_buffer = NULL;
    if (head_size > datalength)
        head_size = datalength;
    http_simple_encode_head(local, encryptdata, head_size);
    if (self->server.param && strlen(self->server.param) == 0)
        self->server.param = NULL;
    strncpy(hosts, self->server.param ? self->server.param : self->server.host, sizeof hosts);
    phost[host_num++] = hosts;
    for (pos = 0; hosts[pos]; ++pos) {
        if (hosts[pos] == ',') {
            phost[host_num++] = &hosts[pos + 1];
            hosts[pos] = 0;
        } else if (hosts[pos] == '#') {
            char * body_pointer = &hosts[pos + 1];
            char * p;
            int trans_char = 0;
            p = body_buffer = (char*)malloc(2048);
            for ( ; *body_pointer; ++body_pointer) {
                if (trans_char) {
                    if (*body_pointer == '\\' ) {
                        *p = '\\';
                    } else if (*body_pointer == 'n' ) {
                        *p = '\r';
                        *++p = '\n';
                    } else {
                        *p = '\\';
                        *++p = *body_pointer;
                    }
                    trans_char = 0;
                } else {
                    if (*body_pointer == '\\') {
                        trans_char = 1;
                        continue;
                    } else if (*body_pointer == '\n') {
                        *p++ = '\r';
                    }
                    *p = *body_pointer;
                }
                ++p;
            }
            *p = 0;
            hosts[pos] = 0;
            break;
        }
    }
    host_num = (int)(xorshift128plus() % (uint64_t)host_num);
    if (self->server.port == 80)
        snprintf(hostport, sizeof(hostport), "%s", phost[host_num]);
    else
        snprintf(hostport, sizeof(hostport), "%s:%d", phost[host_num], self->server.port);
    if (body_buffer) {
        snprintf(out_buffer, 2048,
            "POST /%s HTTP/1.1\r\n"
            "Host: %s\r\n"
            "%s\r\n\r\n",
            local->encode_buffer,
            hostport,
            body_buffer);
    } else {
        char result[33] = {0};
        boundary(result);
        snprintf(out_buffer, 2048,
            "POST /%s HTTP/1.1\r\n"
            "Host: %s\r\n"
            "User-Agent: %s\r\n"
            "Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8\r\n"
            "Accept-Language: en-US,en;q=0.8\r\n"
            "Accept-Encoding: gzip, deflate\r\n"
            "Content-Type: multipart/form-data; boundary=%s\r\n"
            "DNT: 1\r\n"
            "Connection: keep-alive\r\n"
            "\r\n",
            local->encode_buffer,
            hostport,
            g_useragent[g_useragent_index],
            result
            );
    }
    //LOGI("http header: %s", out_buffer);
    outlength = (int)strlen(out_buffer);
    memmove(out_buffer + outlength, encryptdata + head_size, datalength - head_size);
    outlength += datalength - head_size;
    local->has_sent_header = 1;
    if ((int)*capacity < outlength) {
        *pencryptdata = (char*)realloc(*pencryptdata, *capacity = (size_t)(outlength * 2));
        encryptdata = *pencryptdata;
    }
    memmove(encryptdata, out_buffer, outlength);
    free(out_buffer);
    if (body_buffer != NULL)
        free(body_buffer);
    if (local->encode_buffer != NULL) {
        free(local->encode_buffer);
        local->encode_buffer = NULL;
    }
    return outlength;
}

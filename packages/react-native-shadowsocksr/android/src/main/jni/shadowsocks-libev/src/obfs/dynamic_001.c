#include <stdlib.h>
#include <string.h>
#include <stdio.h>
#include <time.h>

#include "dynamic_001.h"
#include "obfsutil.h"

// 假设obfs结构体和相关函数已经定义好
typedef struct dynamic_001_local_data {
    // 这里可以根据需要添加更多的本地数据字段
} dynamic_001_local_data;

obfs * dynamic_001_new_obfs() {
    obfs * self = new_obfs();
    self->l_data = malloc(sizeof(dynamic_001_local_data));
    // 初始化本地数据（如果有需要）
    return self;
}

void dynamic_001_dispose(obfs *self) {
    dynamic_001_local_data *local = (dynamic_001_local_data*)self->l_data;
    // 清理本地数据（如果有需要）
    free(local);
    dispose_obfs(self);
}

int dynamic_001_client_encode(obfs *self, char **pencryptdata, int datalength, size_t* capacity) {
    int total_length = 4 + datalength; // 包头长度4字节加上数据长度
    if ((int)*capacity < total_length) {
        *pencryptdata = (char*)realloc(*pencryptdata, *capacity = (size_t)(total_length));
    }
    char *encryptdata = *pencryptdata;
    memmove(encryptdata + 4, encryptdata, datalength); // 移动原数据，为长度字段腾出空间
    // 前面4字节写入包体长度，网络字节序
    encryptdata[0] = (char)(total_length >> 24);
    encryptdata[1] = (char)(total_length >> 16);
    encryptdata[2] = (char)(total_length >> 8);
    encryptdata[3] = (char)(total_length);
    return total_length;
}

int dynamic_001_client_decode(obfs *self, char **pencryptdata, int datalength, size_t* capacity, int *needsendback) {
    if (datalength < 4) {
        // 数据长度不足以包含长度字段，需要等待更多数据
        return 0;
    }
    char *encryptdata = *pencryptdata;
    // 读取前4字节的长度信息，网络字节序
    int total_length = ((unsigned char)encryptdata[0] << 24) |
                       ((unsigned char)encryptdata[1] << 16) |
                       ((unsigned char)encryptdata[2] << 8) |
                       (unsigned char)encryptdata[3];
    if (datalength < total_length) {
        // 数据长度不足，需要等待更多数据
        return 0;
    }
    *needsendback = 0; // 通常不需要回送数据
    memmove(encryptdata, encryptdata + 4, total_length - 4); // 移动数据覆盖长度字段
    return total_length - 4; // 返回处理后的数据长度
}

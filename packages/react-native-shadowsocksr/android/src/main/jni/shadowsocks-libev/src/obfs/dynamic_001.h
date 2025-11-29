/*
 * dynamic_001.h - Define shadowsocksR server's buffers and callbacks
 *
 * Copyright (C) 2015 - 2016, Break Wa11 <mmgac001@gmail.com>
 */

#ifndef _OBFS_DYNAMIC_001_H
#define _OBFS_DYNAMIC_001_H

#include "obfs.h"

obfs * dynamic_001_new_obfs();
void dynamic_001_dispose(obfs *self);

int dynamic_001_client_encode(obfs *self, char **pencryptdata, int datalength, size_t* capacity);
int dynamic_001_client_decode(obfs *self, char **pencryptdata, int datalength, size_t* capacity, int *needsendback);

#endif // _OBFS_DYNAMIC_001_H

#include "WeWorkFinanceSdk_C.h"
#include <dlfcn.h>
#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>
#include <string>
#include <iostream>
#include <stdexcept>
#include <cstdio>
#include <limits.h>
#include <unistd.h>
#include <libgen.h>

using std::string;

typedef WeWorkFinanceSdk_t* newsdk_t();
typedef int Init_t(WeWorkFinanceSdk_t*, const char*, const char*);
typedef void DestroySdk_t(WeWorkFinanceSdk_t*);

typedef int GetChatData_t(WeWorkFinanceSdk_t*, unsigned long long, unsigned int, const char*, const char*, int, Slice_t*);
typedef Slice_t* NewSlice_t();
typedef void FreeSlice_t(Slice_t*);

typedef int GetMediaData_t(WeWorkFinanceSdk_t*, const char*, const char*, const char*, const char*, int, MediaData_t*);
typedef int DecryptData_t(const char*, const char*, Slice_t*);
typedef MediaData_t* NewMediaData_t();
typedef void FreeMediaData_t(MediaData_t*);

int main(int argc, char* argv[])
{
    int ret = 0;
    if (argc < 3) {
        printf("./sdktools corpid secret cmd(chatmsg、mediadata、decryptdata)\n");
        printf("./sdktools corpid secret chatmsg seq limit proxy passwd timeout\n");
        printf("./sdktools corpid secret mediadata fileid proxy passwd timeout savefile\n");
        printf("./sdktools corpid secret decryptdata encrypt_key encrypt_chat_msg\n");
        return -1;
    }

    char exePath[PATH_MAX];
    ssize_t len = readlink("/proc/self/exe", exePath, sizeof(exePath)-1);
    if (len == -1) {
      printf("无法获取可执行文件路径\n");
      return -1;
    }

    exePath[len] = '\0';
    char* dir = dirname(exePath);
    char libPath[PATH_MAX];
    snprintf(libPath, sizeof(libPath), "%s/libWeWorkFinanceSdk_C.so", dir);
    void* so_handle = dlopen(libPath, RTLD_LAZY);
    if (!so_handle) {
        printf("load sdk so fail:%s\n", dlerror());
        return -1;
    }
    newsdk_t* newsdk_fn = (newsdk_t*)dlsym(so_handle, "NewSdk");
    WeWorkFinanceSdk_t* sdk = newsdk_fn();

    Init_t* init_fn = (Init_t*)dlsym(so_handle, "Init");
    DestroySdk_t* destroysdk_fn = (DestroySdk_t*)dlsym(so_handle, "DestroySdk");
    ret = init_fn(sdk, argv[1], argv[2]);
    if (ret != 0) {
        destroysdk_fn(sdk);
        fprintf(stderr, "init sdk err ret:%d\n", ret);
        return -1;
    }

    if (std::string(argv[3]) == "chatmsg") {
        uint64_t iSeq = strtoul(argv[4], NULL, 10);
        uint64_t iLimit = strtoul(argv[5], NULL, 10);
        uint64_t timeout = strtoul(argv[8], NULL, 10);
        
        NewSlice_t* newslice_fn = (NewSlice_t*)dlsym(so_handle, "NewSlice");
        FreeSlice_t* freeslice_fn = (FreeSlice_t*)dlsym(so_handle, "FreeSlice");

        Slice_t* chatDatas = newslice_fn();
        GetChatData_t* getchatdata_fn = (GetChatData_t*)dlsym(so_handle, "GetChatData");
        ret = getchatdata_fn(sdk, iSeq, iLimit, argv[6], argv[7], timeout, chatDatas);
        if (ret != 0) {
            freeslice_fn(chatDatas);
            fprintf(stderr, "chatmsg err ret:%d\n", ret);
            return -1;
        }
        printf("结果: %s\n", chatDatas->buf);
        freeslice_fn(chatDatas);
    } 
    else if (std::string(argv[3]) == "mediadata") {
        std::string index;
        uint64_t timeout = strtoul(argv[7], NULL, 10);
        int isfinish = 0;

        GetMediaData_t* getmediadata_fn = (GetMediaData_t*)dlsym(so_handle, "GetMediaData");
        NewMediaData_t* newmediadata_fn = (NewMediaData_t*)dlsym(so_handle, "NewMediaData");
        FreeMediaData_t* freemediadata_fn = (FreeMediaData_t*)dlsym(so_handle, "FreeMediaData");

        std::string allMediaData;  // 用于存储所有媒体数据

        while (isfinish == 0) {
            MediaData_t* mediaData = newmediadata_fn();
            ret = getmediadata_fn(sdk, index.c_str(), argv[4], argv[5], argv[6], timeout, mediaData);
            if (ret != 0) {
                freemediadata_fn(mediaData);
                fprintf(stderr, "获取媒体数据错误 ret:%d\n", ret);
                return -1;
            }

            // 将当前块的数据追加到 allMediaData
            allMediaData.append(mediaData->data, mediaData->data_len);

            index.assign(string(mediaData->outindexbuf));
            isfinish = mediaData->is_finish;
            freemediadata_fn(mediaData);
        }

        // 将所有媒体数据输出到标准输出
        std::cout.write(allMediaData.data(), allMediaData.size());
        std::cout.flush();
    } 
    else if (std::string(argv[3]) == "decryptdata") {
        NewSlice_t* newslice_fn = (NewSlice_t*)dlsym(so_handle, "NewSlice");
        FreeSlice_t* freeslice_fn = (FreeSlice_t*)dlsym(so_handle, "FreeSlice");

        Slice_t* Msgs = newslice_fn();
        // decryptdata api
        DecryptData_t* decryptdata_fn = (DecryptData_t*)dlsym(so_handle, "DecryptData");
        ret = decryptdata_fn(argv[4], argv[5], Msgs);
        printf("结果: %s\n", Msgs->buf);

        freeslice_fn(Msgs);
    }

    return ret;
}

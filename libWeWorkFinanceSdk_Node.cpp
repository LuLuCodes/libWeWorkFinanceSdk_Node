#include <napi.h>
#include "WeWorkFinanceSdk_C.h"
#include <dlfcn.h>
#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>
#include <string>
#include <vector>

using namespace Napi;

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

class WeWorkFinanceSDK : public Napi::ObjectWrap<WeWorkFinanceSDK> {
public:
    static Napi::Object Init(Napi::Env env, Napi::Object exports);
    WeWorkFinanceSDK(const Napi::CallbackInfo& info);
    ~WeWorkFinanceSDK();

private:
    static Napi::FunctionReference constructor;
    WeWorkFinanceSdk_t* sdk;
    void* so_handle;

    Napi::Value GetChatData(const Napi::CallbackInfo& info);
    Napi::Value GetMediaData(const Napi::CallbackInfo& info);
    Napi::Value DecryptData(const Napi::CallbackInfo& info);

    // 函数指针
    newsdk_t* newsdk_fn;
    Init_t* init_fn;
    DestroySdk_t* destroysdk_fn;
    GetChatData_t* getchatdata_fn;
    NewSlice_t* newslice_fn;
    FreeSlice_t* freeslice_fn;
    GetMediaData_t* getmediadata_fn;
    NewMediaData_t* newmediadata_fn;
    FreeMediaData_t* freemediadata_fn;
    DecryptData_t* decryptdata_fn;
};

Napi::FunctionReference WeWorkFinanceSDK::constructor;

Napi::Object WeWorkFinanceSDK::Init(Napi::Env env, Napi::Object exports) {
    Napi::HandleScope scope(env);

    Napi::Function func = DefineClass(env, "WeWorkFinanceSDK", {
        InstanceMethod("getChatData", &WeWorkFinanceSDK::GetChatData),
        InstanceMethod("getMediaData", &WeWorkFinanceSDK::GetMediaData),
        InstanceMethod("decryptData", &WeWorkFinanceSDK::DecryptData),
    });

    constructor = Napi::Persistent(func);
    constructor.SuppressDestruct();

    exports.Set("WeWorkFinanceSDK", func);
    return exports;
}

WeWorkFinanceSDK::WeWorkFinanceSDK(const Napi::CallbackInfo& info) : Napi::ObjectWrap<WeWorkFinanceSDK>(info) {
    Napi::Env env = info.Env();

    if (info.Length() < 2) {
        Napi::TypeError::New(env, "错误的参数数量").ThrowAsJavaScriptException();
        return;
    }

    std::string corpid = info[0].As<Napi::String>().Utf8Value();
    std::string secret = info[1].As<Napi::String>().Utf8Value();

    so_handle = dlopen("./lib/libWeWorkFinanceSdk_C.so", RTLD_LAZY);
    if (!so_handle) {
        const char* error = dlerror();
        std::string errorMsg = "加载SDK失败: ";
        errorMsg += (error ? error : "未知错误");
        Napi::Error::New(env, errorMsg).ThrowAsJavaScriptException();
        return;
    }

    // 加载所有需要的函数
    newsdk_fn = (newsdk_t*)dlsym(so_handle, "NewSdk");
    init_fn = (Init_t*)dlsym(so_handle, "Init");
    destroysdk_fn = (DestroySdk_t*)dlsym(so_handle, "DestroySdk");
    getchatdata_fn = (GetChatData_t*)dlsym(so_handle, "GetChatData");
    newslice_fn = (NewSlice_t*)dlsym(so_handle, "NewSlice");
    freeslice_fn = (FreeSlice_t*)dlsym(so_handle, "FreeSlice");
    getmediadata_fn = (GetMediaData_t*)dlsym(so_handle, "GetMediaData");
    newmediadata_fn = (NewMediaData_t*)dlsym(so_handle, "NewMediaData");
    freemediadata_fn = (FreeMediaData_t*)dlsym(so_handle, "FreeMediaData");
    decryptdata_fn = (DecryptData_t*)dlsym(so_handle, "DecryptData");

    if (!newsdk_fn || !init_fn || !destroysdk_fn || !getchatdata_fn || !newslice_fn || !freeslice_fn || !getmediadata_fn || !newmediadata_fn || !freemediadata_fn || !decryptdata_fn) {
        Napi::Error::New(env, "加载函数指针失败").ThrowAsJavaScriptException();
        return;
    }

    sdk = newsdk_fn();

    int ret = init_fn(sdk, corpid.c_str(), secret.c_str());
    if (ret != 0) {
        destroysdk_fn(sdk);
        Napi::Error::New(env, "初始化SDK失败").ThrowAsJavaScriptException();
    }
}

WeWorkFinanceSDK::~WeWorkFinanceSDK() {
    if (sdk) {
        destroysdk_fn(sdk);
    }
    if (so_handle) {
        dlclose(so_handle);
    }
}

Napi::Value WeWorkFinanceSDK::GetChatData(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();

    if (info.Length() < 5) {
        Napi::TypeError::New(env, "错误的参数数量").ThrowAsJavaScriptException();
        return env.Null();
    }

    uint64_t seq = info[0].As<Napi::Number>().Uint32Value();
    uint64_t limit = info[1].As<Napi::Number>().Uint32Value();
    std::string proxy = info[2].As<Napi::String>().Utf8Value();
    std::string passwd = info[3].As<Napi::String>().Utf8Value();
    uint64_t timeout = info[4].As<Napi::Number>().Uint32Value();

    Slice_t* chatDatas = newslice_fn();
    int ret = getchatdata_fn(sdk, seq, limit, proxy.c_str(), passwd.c_str(), timeout, chatDatas);

    if (ret != 0) {
        freeslice_fn(chatDatas);
        Napi::Error::New(env, "获取聊天数据失败").ThrowAsJavaScriptException();
        return env.Null();
    }

    Napi::String result = Napi::String::New(env, chatDatas->buf, chatDatas->len);
    freeslice_fn(chatDatas);

    return result;
}

Napi::Value WeWorkFinanceSDK::GetMediaData(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();

    if (info.Length() < 5) {
        Napi::TypeError::New(env, "错误的参数数量").ThrowAsJavaScriptException();
        return env.Null();
    }

    std::string sdkfileid = info[0].As<Napi::String>().Utf8Value();
    std::string proxy = info[1].As<Napi::String>().Utf8Value();
    std::string passwd = info[2].As<Napi::String>().Utf8Value();
    uint64_t timeout = info[3].As<Napi::Number>().Uint32Value();
    std::string savefile = info[4].As<Napi::String>().Utf8Value();

    std::string index;
    int isfinish = 0;
    std::vector<char> fileData;

    while (isfinish == 0) {
        MediaData_t* mediaData = newmediadata_fn();
        int ret = getmediadata_fn(sdk, index.c_str(), sdkfileid.c_str(), proxy.c_str(), passwd.c_str(), timeout, mediaData);

        if (ret != 0) {
            freemediadata_fn(mediaData);
            Napi::Error::New(env, "获取媒体数据失败").ThrowAsJavaScriptException();
            return env.Null();
        }

        fileData.insert(fileData.end(), mediaData->data, mediaData->data + mediaData->data_len);
        index.assign(mediaData->outindexbuf);
        isfinish = mediaData->is_finish;
        freemediadata_fn(mediaData);
    }

    FILE* fp = fopen(savefile.c_str(), "wb");
    if (fp == NULL) {
        Napi::Error::New(env, "无法打开文件进行写入").ThrowAsJavaScriptException();
        return env.Null();
    }

    fwrite(fileData.data(), 1, fileData.size(), fp);
    fclose(fp);

    return Napi::String::New(env, "媒体文件已保存");
}

Napi::Value WeWorkFinanceSDK::DecryptData(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();

    if (info.Length() < 2) {
        Napi::TypeError::New(env, "错误的参数数量").ThrowAsJavaScriptException();
        return env.Null();
    }

    std::string encrypt_key = info[0].As<Napi::String>().Utf8Value();
    std::string encrypt_msg = info[1].As<Napi::String>().Utf8Value();

    Slice_t* msgs = newslice_fn();
    int ret = decryptdata_fn(encrypt_key.c_str(), encrypt_msg.c_str(), msgs);

    if (ret != 0) {
        freeslice_fn(msgs);
        Napi::Error::New(env, "解密数据失败").ThrowAsJavaScriptException();
        return env.Null();
    }

    Napi::String result = Napi::String::New(env, msgs->buf, msgs->len);
    freeslice_fn(msgs);

    return result;
}

Napi::Object Init(Napi::Env env, Napi::Object exports) {
    return WeWorkFinanceSDK::Init(env, exports);
}

NODE_API_MODULE(WeWorkFinanceSDK, Init)
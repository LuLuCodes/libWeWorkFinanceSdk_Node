#include <napi.h>
#include "WeWorkFinanceSdk_C.h"
#include <string>

class WeWorkFinanceSDK : public Napi::ObjectWrap<WeWorkFinanceSDK> {
public:
  static Napi::Object Init(Napi::Env env, Napi::Object exports);
  WeWorkFinanceSDK(const Napi::CallbackInfo& info);
  ~WeWorkFinanceSDK();

private:
  static Napi::FunctionReference constructor;
  WeWorkFinanceSdk_t* sdk;
  std::string current_sdk_fileid;
  std::string current_index_buf;

  Napi::Value Init(const Napi::CallbackInfo& info);
  Napi::Value GetChatData(const Napi::CallbackInfo& info);
  Napi::Value DecryptData(const Napi::CallbackInfo& info);
  Napi::Value GetMediaData(const Napi::CallbackInfo& info);
  Napi::Value GetMediaDataChunk(const Napi::CallbackInfo& info);
};

Napi::FunctionReference WeWorkFinanceSDK::constructor;

WeWorkFinanceSDK::WeWorkFinanceSDK(const Napi::CallbackInfo& info) : Napi::ObjectWrap<WeWorkFinanceSDK>(info) {
  this->sdk = NewSdk();
}

WeWorkFinanceSDK::~WeWorkFinanceSDK() {
  if (this->sdk) {
    DestroySdk(this->sdk);
  }
}

Napi::Object WeWorkFinanceSDK::Init(Napi::Env env, Napi::Object exports) {
  Napi::Function func = DefineClass(env, "WeWorkFinanceSDK", {
    InstanceMethod("init", &WeWorkFinanceSDK::Init),
    InstanceMethod("getChatData", &WeWorkFinanceSDK::GetChatData),
    InstanceMethod("decryptData", &WeWorkFinanceSDK::DecryptData),
    InstanceMethod("getMediaData", &WeWorkFinanceSDK::GetMediaData),
    InstanceMethod("getMediaDataChunk", &WeWorkFinanceSDK::GetMediaDataChunk),
  });

  constructor = Napi::Persistent(func);
  constructor.SuppressDestruct();

  exports.Set("WeWorkFinanceSDK", func);
  return exports;
}

Napi::Value WeWorkFinanceSDK::Init(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();
  
  if (info.Length() < 2) {
    Napi::TypeError::New(env, "Wrong number of arguments").ThrowAsJavaScriptException();
    return env.Null();
  }

  std::string corpid = info[0].As<Napi::String>();
  std::string secret = info[1].As<Napi::String>();

  int result = ::Init(this->sdk, corpid.c_str(), secret.c_str());

  if (result != 0) {
    Napi::Error::New(env, "Failed to initialize SDK").ThrowAsJavaScriptException();
    return env.Null();
  }

  return Napi::Number::New(env, result);
}

Napi::Value WeWorkFinanceSDK::GetChatData(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();
  
  if (info.Length() < 6) {
    Napi::TypeError::New(env, "Wrong number of arguments").ThrowAsJavaScriptException();
    return env.Null();
  }

  unsigned long long seq = info[0].As<Napi::Number>().Int64Value();
  unsigned int limit = info[1].As<Napi::Number>().Uint32Value();
  std::string proxy = info[2].As<Napi::String>();
  std::string passwd = info[3].As<Napi::String>();
  int timeout = info[4].As<Napi::Number>().Int32Value();

  Slice_t* chatData = NewSlice();
  int result = ::GetChatData(this->sdk, seq, limit, proxy.c_str(), passwd.c_str(), timeout, chatData);

  if (result != 0) {
    FreeSlice(chatData);
    Napi::Error::New(env, "Failed to get chat data").ThrowAsJavaScriptException();
    return env.Null();
  }

  Napi::Object returnObject = Napi::Object::New(env);
  returnObject.Set("data", Napi::String::New(env, GetContentFromSlice(chatData)));
  returnObject.Set("len", Napi::Number::New(env, GetSliceLen(chatData)));

  FreeSlice(chatData);
  return returnObject;
}

Napi::Value WeWorkFinanceSDK::DecryptData(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();
  
  if (info.Length() < 2) {
    Napi::TypeError::New(env, "Wrong number of arguments").ThrowAsJavaScriptException();
    return env.Null();
  }

  std::string encrypt_key = info[0].As<Napi::String>();
  std::string encrypt_msg = info[1].As<Napi::String>();

  Slice_t* msg = NewSlice();
  int result = ::DecryptData(encrypt_key.c_str(), encrypt_msg.c_str(), msg);

  if (result != 0) {
    FreeSlice(msg);
    Napi::Error::New(env, "Failed to decrypt data").ThrowAsJavaScriptException();
    return env.Null();
  }

  Napi::Object returnObject = Napi::Object::New(env);
  returnObject.Set("data", Napi::String::New(env, GetContentFromSlice(msg)));
  returnObject.Set("len", Napi::Number::New(env, GetSliceLen(msg)));

  FreeSlice(msg);
  return returnObject;
}

Napi::Value WeWorkFinanceSDK::GetMediaData(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();
  
  if (info.Length() < 6) {
    Napi::TypeError::New(env, "Wrong number of arguments").ThrowAsJavaScriptException();
    return env.Null();
  }

  std::string sdk_fileid = info[1].As<Napi::String>();
  std::string proxy = info[2].As<Napi::String>();
  std::string passwd = info[3].As<Napi::String>();
  int timeout = info[4].As<Napi::Number>().Int32Value();

  // 重置当前文件ID和索引缓冲区
  this->current_sdk_fileid = sdk_fileid;
  this->current_index_buf = "";

  Napi::Object returnObject = Napi::Object::New(env);
  returnObject.Set("sdkFileid", Napi::String::New(env, sdk_fileid));
  returnObject.Set("isFinish", Napi::Boolean::New(env, false));

  return returnObject;
}

Napi::Value WeWorkFinanceSDK::GetMediaDataChunk(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();
  
  if (info.Length() < 4) {
    Napi::TypeError::New(env, "Wrong number of arguments").ThrowAsJavaScriptException();
    return env.Null();
  }

  std::string proxy = info[0].As<Napi::String>();
  std::string passwd = info[1].As<Napi::String>();
  int timeout = info[2].As<Napi::Number>().Int32Value();

  MediaData_t* media_data = NewMediaData();
  int result = ::GetMediaData(this->sdk, this->current_index_buf.c_str(), this->current_sdk_fileid.c_str(), proxy.c_str(), passwd.c_str(), timeout, media_data);

  if (result != 0) {
    FreeMediaData(media_data);
    Napi::Error::New(env, "Failed to get media data chunk").ThrowAsJavaScriptException();
    return env.Null();
  }

  Napi::Object returnObject = Napi::Object::New(env);
  returnObject.Set("data", Napi::Buffer<char>::Copy(env, GetData(media_data), GetDataLen(media_data)));
  returnObject.Set("isFinish", Napi::Boolean::New(env, IsMediaDataFinish(media_data)));

  // 更新索引缓冲区为下一次请求做准备
  this->current_index_buf = GetOutIndexBuf(media_data);

  FreeMediaData(media_data);
  return returnObject;
}

Napi::Object Init(Napi::Env env, Napi::Object exports) {
  return WeWorkFinanceSDK::Init(env, exports);
}

NODE_API_MODULE(wework_finance_sdk, Init)
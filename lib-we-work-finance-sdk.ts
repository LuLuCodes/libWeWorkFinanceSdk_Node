/*
 * @Author: leyi leyi@myun.info
 * @Date: 2024-10-19 10:06:58
 * @LastEditors: leyi leyi@myun.info
 * @LastEditTime: 2024-10-22 18:17:19
 * @FilePath: /deep-ai-health-wx-service/src/libs/lib-we-work-finance-sdk.ts
 * @Description:
 *
 * Copyright (c) 2024 by ${git_name_email}, All Rights Reserved.
 */
import { execFile } from 'child_process';
import * as util from 'util';
import NodeRSA from 'node-rsa';
import * as path from 'path';
import { safetyParseJson } from './util';

const execFilePromise = util.promisify(execFile);

export default class libWeWorkFinanceSdk {
  private _corpid = '';
  private _chat_secret = '';
  private _private_key = '';
  private readonly sdk_path: string;
  constructor({
    corpid,
    chat_secret,
    private_key,
  }: {
    corpid: string;
    chat_secret: string;
    private_key: string;
  }) {
    this._corpid = corpid;
    this._chat_secret = chat_secret;
    this._private_key = private_key;
    this.sdk_path = path.resolve(__dirname, '../../sdk/WeWorkFinanceSdk');
  }

  rsaDecrypt(encrypted_text: string) {
    try {
      const rsa = new NodeRSA(this._private_key);
      rsa.setOptions({
        encryptionScheme: 'pkcs1',
        environment: 'browser',
      });

      // 返回解密后的文本
      return rsa.decrypt(encrypted_text).toString('utf8');
    } catch (error) {
      console.error('RSA解密失败:', error.message);
      return null;
    }
  }

  async chatmsg({
    seq,
    limit,
    timeout,
  }: {
    seq: number;
    limit?: number;
    timeout?: number;
  }) {
    try {
      const { stdout, stderr } = await execFilePromise(this.sdk_path, [
        this._corpid,
        this._chat_secret,
        'chatmsg',
        `${seq || 0}`,
        `${limit || 100}`,
        '',
        '',
        `${timeout || 6000}`,
      ]);

      if (stderr && stderr.length > 0) {
        console.error('错误:', stderr);
        return null;
      }

      // 解析输出以获取结果
      const resultMatch = stdout.match(/结果: (.+)/);
      if (resultMatch) {
        return safetyParseJson(resultMatch[1]);
      }
    } catch (error) {
      console.error('执行错误:', error);
    }

    return null;
  }

  async decryptdata({
    encrypt_random_key,
    encrypt_chat_msg,
  }: {
    encrypt_random_key: string;
    encrypt_chat_msg: string;
  }) {
    try {
      const encrypt_key = this.rsaDecrypt(encrypt_random_key);
      const { stdout, stderr } = await execFilePromise(this.sdk_path, [
        this._corpid,
        this._chat_secret,
        'decryptdata',
        encrypt_key,
        encrypt_chat_msg,
      ]);

      if (stderr && stderr.length > 0) {
        console.error('错误:', stderr);
        return null;
      }

      // 解析输出以获取结果
      const resultMatch = stdout.match(/结果: (.+)/);
      if (resultMatch) {
        return safetyParseJson(resultMatch[1]);
      }
    } catch (error) {
      console.error('执行错误:', error);
    }
    return null;
  }

  async mediadata({ fileid, timeout }: { fileid: string; timeout?: number }) {
    try {
      const { stdout, stderr } = await execFilePromise(
        this.sdk_path,
        [
          this._corpid,
          this._chat_secret,
          'mediadata',
          fileid,
          '',
          '',
          `${timeout || 360000}`,
        ],
        { encoding: 'buffer', maxBuffer: 1024 * 1024 * 500 }
      );

      if (stderr && stderr.length > 0) {
        console.error('错误:', stderr);
        return null;
      }

      // 解析输出以获取结果
      if (stdout && stdout.length > 0) {
        return stdout;
      }
    } catch (error) {
      console.error('执行错误:', error);
    }
    return null;
  }
}

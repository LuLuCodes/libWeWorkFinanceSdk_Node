const { execFile } = require('child_process');
const rsaDecrypt = require('./rsaDecrypt');
const util = require('util');
const fs = require('fs');
const path = require('path');

const execFilePromise = util.promisify(execFile);

const corpid = 'ww6d13a63fdc80988d';
const secret = '2j_qCZwvZmjBx_LKHwMN_2YnxBp7SZntGZ62zW-PeHs';

const privateKey = `
-----BEGIN PRIVATE KEY-----
MIIEvwIBADANBgkqhkiG9w0BAQEFAASCBKkwggSlAgEAAoIBAQDLKi7P6YRUQl/k
cHH/0qWAaczw2oWvSz+lu0pxopMzeSm1Pp9uYB0tvivfsT5FNq/8F2FPZqNDopQW
ECkXWp5uyhjzKBcMGwpKE4dNUmw5+rqZLDKtRylPtXcn045Evhfch7KJi67V7EW2
C4BiPTYomiH22X7adZJEhdM2YRGkHWzROPrSGiGHN5z23yO8/PIVvsa9qq3hkvGw
9neQEZo971EW3n7Zfbe7n3yEid3aCxUTx6JOTQZkIiRmvWTsMINqJZVi2yJr8Qdr
QOpFk3dFy9G4U0jQ9u+95uN+qtSZSYNoa0Uc96rIFxfXGeJOpXELFyaGGw204tyH
vRJQm6nfAgMBAAECggEBAL9xlIMfDS9JDIt62jGzEXmcOR6NDIROaD+H6XKDPCq4
9fBwflPIBjbgiP9VSdR24AaxEWV81kQZo2nW+KGlJr5HepNHJ9CkemGrXUgjbxCD
j+pel7Jo6CjQWuQQmnN0nY+V30t1cN7sshQFaokoHSzNcUvnT34UZCxl3s3TUohN
8aMvYa3Ed4P/xEJQ9nqIDTnBqoE5/d00QBJl3Al1QxSWvX5Q0PdVx4SWfyfobI15
907yEqvsc3Gmfad5jVutt88HtUVLV/Ol2zwHTpWV2zOQoUjelaz32Rw3nAJNhaqT
8YJJ0DTIPe8ws4DIbEUpGQau3G8siNEI7T7DaLLXYeECgYEA/n//jc8dEbLmRWq2
Q924Hfp3TrSEh8PKY4e3JjTDi947m+zdqaidQFUVjk9oWjgeNkTjsmvbXrItobmm
JamA0p66j9j32CZnfUSordhoyQgCh218KosRcTynJD7EhYFMCpVON7UIsjMUKo0+
VIj+w6eSjjOKh//AAAQx3tIiEaUCgYEAzFy6QnWGGgZlgP4JGez4nxrehjNptImF
PwYWOBKoDsOdJfq8mnWDKu8YP+Tg9gDG5U3l502+6Qzc4oZkpUOaIw3HXLPrSzRR
e40j1ykD8XkU/04bfUUHJVA3AftUSx0fqZTNrvsXZtnDdXLdG6tDsaasS2SeHntg
QLdoWWxErjMCgYAdoC7ShjKfFdFCcWqoOc4uBzMOQWtQFpWfwnOqiefdh1AvFYK0
NkGf9Iee2lWOcwvpS1mqMm4F9v3i3qadqb6qRfn3ts0bJ1VSusRcAF4qULlipHcY
yLmOEf5u9LORyvxcGwdQ6s0JWXLWhTylQJFPm1kvHobY0Ae8uMBJbPK0VQKBgQDM
EbCBGuBNbqO/em1WMTdXkboxondkq4qeE5LubVraW2W6fjYFu2C+58B8VS57GO2E
HxR7tDv2djzAC1nHWck6RdEVdih4kYbobFkkyrVAVRutka6Lmfl3vjEfznwvAacT
bR8zI1MMBlpTFt9KeOwBIyGbq57la2gDV+JgoWe31wKBgQDKiSB+DXiQkFzj48PM
CY9QNHJ79sXsrHZnnDEmpJIedaQQfRM4IKYAb4ZjzHm7lzsq3LCui2G5kNjXk157
TCoeA3iQMBtDgdUgUhlUHJ82E723rMzE1j2PQani88wnVQVnzbq26+IEcjecPeWF
u0D2MAAmKxSo6gqtH1uBmrCgXg==
-----END PRIVATE KEY-----
`;

async function chatmsg(seq, limit, timeout = 6000) {
  try {
    const { stdout, stderr } = await execFilePromise('./WeWorkFinanceSdk', [
      corpid,
      secret,
      'chatmsg',
      seq,
      limit,
      '',
      '',
      timeout,
    ]);

    console.log('输出:', stdout);

    if (stderr && stderr.length > 0) {
      console.error('错误:', stderr.toString());
    }

    // 解析输出以获取结果
    const resultMatch = stdout.match(/结果: (.+)/);
    if (resultMatch) {
      return resultMatch[1];
    } else {
      return '未找到结果';
    }
  } catch (error) {
    console.error('执行错误:', error);
    return '执行出错';
  }
}

async function decryptdata(encrypt_random_key, encrypt_msg) {
  try {
    const encrypt_key = rsaDecrypt(encrypt_random_key, privateKey);
    const { stdout, stderr } = await execFilePromise('./WeWorkFinanceSdk', [
      corpid,
      secret,
      'decryptdata',
      encrypt_key,
      encrypt_msg,
    ]);

    console.log('输出:', stdout);

    if (stderr && stderr.length > 0) {
      console.error('错误:', stderr.toString());
    }

    // 解析输出以获取结果
    const resultMatch = stdout.match(/结果: (.+)/);
    if (resultMatch) {
      return resultMatch[1];
    } else {
      return '未找到结果';
    }
  } catch (error) {
    console.error('执行错误:', error);
    return '执行出错';
  }
}

async function mediadata(fileid) {
  try {
    const { stdout, stderr } = await execFilePromise(
      './WeWorkFinanceSdk',
      [corpid, secret, 'mediadata', fileid, '', '', 60000],
      { encoding: 'buffer', maxBuffer: 1024 * 1024 * 500 }
    );

    if (stderr && stderr.length > 0) {
      console.error('错误:', stderr.toString());
    }

    // 解析输出以获取结果
    if (stdout && stdout.length > 0) {
      // 将结果保存为图片

      const imagePath = path.join(__dirname, `media_${Date.now()}.mp3`);
      fs.writeFileSync(imagePath, stdout);
      console.log(`图片已保存至: ${imagePath}`);
      return imagePath;
    } else {
      return '未找到结果';
    }
  } catch (error) {
    console.error('执行错误:', error);
    return '执行出错';
  }
}

(async () => {
  // await chatmsg(560, 1);
  // await decryptdata(
  //   'NDKYaG5shIqZNGwHdvrUunNCnbBTTQ8D37aNjbJe7aAvJ4QycofnVVt84iM6WUQ3DAerWnbyWJMcB0AeAcM6rjWJbhLANpuP1Y6P5VRpe0LhtC2AiobLZ6OuKdxaEvAvZ7ONOAvNmYW3yP8lGnfvUypczknyDzTznF5W1OQsK4Gk0dpbXP2li8ePfqZZ3bRgqryws2Ubo9hcgaYLpwtzAlW+PyZoaDw98gOcS277KJnWlRSXxoN+AM3jQON33o6fLy6pw7loytd0Z2EmdQOGwV2GO0T03v1EH24bFNOTTrUBxnyeT3DhgkyO5IAZ224EbPbIbksddsIJsXIH9IM2vg==',
  //   'ztliIB63HTcwAzxVGBm7KldAP4OSLB8WbnqabAYdjsSWNuTqfgmcXn/zavCwt5bQ12RLzGJGCaVSEX2wtjKTQI2fOKk8lwGzj84CAokl++nAM2ZXVc7Z0vQCUmcw3tvGQz1L41uAq9+AV3E6zlsE0Q+ZkwIcHC3/xpW4Qzo6iivGoCqsaMhcnoY4k9EXDz9M8WwU2hXKpg+sL7jB+wn0k2GOUo94NCXKNEDytSgR7g9RXo5W6MNCR8P7p+mbxBa3gzQMq/DFM8TMWmOZ81ubzmQY0bg4kDIOrrtzLEGJW2Aebo5jQ+9K7ec0jTMZNb1Z2gzyWdujSjPKQTVVDBLR783+m/5PrJlz86ur66iiE490QL/PSHw9I9tvljwdtQT2rrsXxQ6i4SU01f00lkH5s8KsDuXI79UFohpn9Ob77GXg1AW1YV6CO6JXqNChdZqvO8bw5hq4Q5BWxi0Q/b2JNQIXHi/uua1qjhbKaCYClxrXqnmgYlDIdu0ZD9/jsov7rd0YmqBzuRm+Bh+zuDFv1Xp+VJNH1BxwYCbYUil8QvcWtewLIwhTaD6jV0nY60/4sTUSP8TfNMtHdPQfZHdi0LImXk2uFmuctkcTDhNJe0zbRPGVIArNr6oRfoyAlbMQHnNMHJadWqLi07UiehwCl6pCsP5J6w90oxlUSPHJzp6Q/oLl542l46ncxfBlXVLRgLFZMoWoUYf9+WKqf3KML00RYQWVkRa2baXYr/ynAfIHbAZb1HoIpCTdjvZoHcTz6K/j+2vSUwhIdvDheFDw2L52Igtarw7KunQphihGd7UrmkYotu8uPktxza/q4lb3gg2aTPrbpbXxDWwhph1B2w99T/R7f9/oiQpNOlAKwP3QE6e93lY807mwSchLoleqo6avt0t86Bw0x8Qyq3m7gHBhVn//Zb5t1S5ndcSoOFJxBmUALNvXYvSz3/WlYGNoAW6kMuS0Lp4e2cyCbj468dUu8V3lvrKzyAr3sRElIF7CLTD3cwvXgCtYq3R0N14UgSs63GtzQF/X+jo5r8qPz8UXnrC5r9Ojauf1XfbF3Y2wnYlo7n6RJs+EhS5aoUnqO2T0ErXmQobV5Ae8Pf3IeK31bmM11YJ/G9nWTOA9HjCdkYxB4who+YmZzBhZa0aO1RPz65/1Yicy2xYZlT5g1E9ozs+a2pjb/d7Plbmdj/WVHAEOMuTcqsVhC1iU1zkeKijymQgx/m+N9namA//Krj8pX1cQ3LSplWDuxviqYPLkkH6EW7diRLLsIU973bxbDOjEs+/pQDPsHIEGa1GykzsM3dcesdq/jaEYmQzHeg3sybAB+Dh1/HWbquo5zb9fJPEnS3zp4fxH2I812imfCe+LSHW8Qhsk3ljar0/lxBw/3IqrJl23llDygp+lPbbj3dKa959MFLvkTlyAZz9eZ2pchmodYn8VrDf5Fip60mZ1cd5yIr6qfY01GA5ROyLFDlQQWe6TFmILb/xnDTDHamj1r1ZVQFcuFEU3YQ7bHMfOL3CrKM7G+cz0lPKge1Rr0XyNflJBBzomog463xDxPSB61IZ1hm1AeaGqK8JdzYO38LxT2hZkMsLPJDSc7cuRuc9Ojt/kVxiwLCp1GEhObiVi5o5OEyyoquPpJTEQe6OES2YclZSpmD2PO78LkzBuJZ42a+axiTCcZL757y87q4EC/J+2XRfbA/BrvP1sZUbXeZcwT9XwynwCkenKbGfgWlveyTKESSgCgGXDybB8RIC0BiWaGRxstfagaN1mR/x/4G0fs4i71YdBokSpxSo//LjvL/47QfwO7A+TaQ/apEcKkHBHfIb8chSu2M/cFtMixPZlRXUst9Iipy+e2W9IhJqr+DPb3SN/p7NoJuPk+HvsQ4uUPC/NZ3Nzdlqf3SWEPyNZk=kDgxljjZExxkF0l'
  // );
  await mediadata(
    'CtsDKjEqRjM0aFNOTVJFWUYrQk5nVGZOdFlvL1pCcUdqZ0EyWHlYQStTUVJGQ2tqSDgxa0pjTkI0eXhycVoyNXB4YjkvVjBsQmxQZjByZDdDMjZhSWVXZFlXK1VadEdaL2QzVTFYb2xNTE5scS90OFNNVTlSYzVOOU94blB1TjBRSmswZU5OSkhVUzFXamVWWitZcXdzdTVQbGs4RFNRMGxvTTJBeHlTZ0p6SE9GUlY3WkJFc2FHb2FHc080UTNld3VKTzlWUFdhWGI5eGVjaTNWQXpLMmdqaW5oZStwdXBGUmRybmxIazhURnlHdTNrWUNLMlQyVWUrWHk2OHVIZm12VERBWWpPdUpycStDSW5WYitQSk9VZXMwNEdQV3NNa0RuRldXWHhvTlZ5S3RQWHhudlMzbkc0Tk03QlZMQ3dKemxIcTQ2L2xLeEFoNEJRQzR6bjJMMDRTY0ZqakJVWWJDOThHU2dHc0grcURSdVBEdU5rMXBCTmd1NXc5Y3hoWEpjcklFa0kyQ0FjbTljMU1jTWxvTEVHQ3E0dGRKeXdLNGpYVzA4ZFpRcThFU0UrYlkvUWU1aC9MRkg1VE1GRCtBZTZsQ1FkR0JVVW5mTG85bFZIVmdtNVFRZkE9PRI4TkRkZk56ZzRNVEk1T1Rnd09Ua3pNamMyT1Y4Mk1UVTFPRGt5TlRoZk1UY3pNall3TlRJNU53PT0aIDc4Njc2MjY2NzM3NzcxNzM2ODZhNzQ2MzcwNjY2YjZj'
  );
})();

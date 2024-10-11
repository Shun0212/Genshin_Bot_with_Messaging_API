function doPost(e) {

  let eventData = JSON.parse(e.postData.contents).events[0];
  let replyToken = eventData.replyToken;
  let userMessage = eventData.message.text;
  let userId = eventData.source.userId;

  // ユーザー名を取得
  let userName = getUserName(userId);

  let url = 'https://api.line.me/v2/bot/message/reply';
  let replyMessage = "うん";
  let defaultUrlPICT = 'https://enka.network/ui/UI_RelicIcon_15032_1.png';  // デフォルトの画像URL
  let urlPICT = defaultUrlPICT;

  if (userMessage.charAt(0) === "/") {
    let command = userMessage.split("/");
    if (command[1] === "help") {
      replyMessage = "現在作成中です.\n enka.networkに登録されているデータをもとにいろいろなデータを送信します。\n 使い方:/status/(あなたのUID)…あなたのプレイヤー情報を教えてくれます \n /score/（あなたのUID）/スコア計算につかうもの（HP,熟知,攻撃から選んでください）./(あなたのキャラクター) \n 使用例:/score/8123456/HP/ヌヴィレット";
    } else if (command[1] === "status") {
      replyMessage = extractPlayerInfo(command[2]);
      urlPICT = extractPictURL(command[2], 0);

      if (replyMessage === "データの取得に失敗しました。") {
        replyMessage = "このデータはenka.networkに登録されていない可能性があります。";
        urlPICT = defaultUrlPICT;
      } else {
        urlPICT = extractPictURL(command[2], 0);
      }
    } else if (command[1] === "score") {
      urlPICT = extractPictURL(command[2], whereWantScore(command[2], command[4]));
      var score = getFirstAvatarInfo(command[2], command[3], whereWantScore(command[2], command[4]));
      replyMessage = "あなたの" + command[4] + "の聖遺物スコアは" + score + "です!!";
      writeToSheet(SPREADSHEET_ID, command, command[2], score);
    } else {
      replyMessage = askChatGPT(userMessage);
    }
  }

  let messages = [{
    "type": "text",
    "text": replyMessage,
  }];

  if (urlPICT !== defaultUrlPICT) {
    messages.unshift({
      'type': 'image',
      'originalContentUrl': urlPICT,
      'previewImageUrl': urlPICT
    });
  }

  let payload = {
    'replyToken': replyToken,
    'messages': messages
  };

  let options = {
    'method': 'POST',
    'headers': {
      'Authorization': 'Bearer ' + token,
      'Content-Type': 'application/json',
    },
    'payload': JSON.stringify(payload)
  };

  UrlFetchApp.fetch(url, options);

  // ユーザー名、メッセージ内容、返答を記録
  writeMessageToSheet(userName, userMessage, replyMessage);
}

// ユーザーIDからユーザー名を取得する関数
function getUserName(userId) {
  let url = 'https://api.line.me/v2/bot/profile/' + userId;
  let options = {
    'method': 'GET',
    'headers': {
      'Authorization': 'Bearer ' + token,
    },
  };

  try {
    let response = UrlFetchApp.fetch(url, options);
    let userProfile = JSON.parse(response.getContentText());
    return userProfile.displayName;
  } catch (error) {
    Logger.log("Error fetching user profile: " + error);
    return userId;  // エラーが発生した場合はユーザーIDを返す
  }
}

// メッセージを記録する関数
function writeMessageToSheet(userName, userMessage, replyMessage) {
  var spreadsheetId = SPREADSHEET_ID;
  var sheetName = 'message';

  var spreadsheet = SpreadsheetApp.openById(spreadsheetId);
  var sheet = spreadsheet.getSheetByName(sheetName);

  if (!sheet) {
    Logger.log('シートが見つかりません: ' + sheetName);
    return;
  }

  var now = new Date();
  var timestamp = Utilities.formatDate(now, Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss');

  var row = [timestamp, userName, userMessage, replyMessage];

  sheet.appendRow(row);
}

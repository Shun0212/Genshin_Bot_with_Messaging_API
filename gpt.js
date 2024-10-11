function askChatGPT(question) {
  var apiKey = ChatGPTKEY;  // OpenAI APIキーを指定
  var url = 'https://api.openai.com/v1/chat/completions';

  // スプレッドシートのIDとシート名
  var spreadsheetId = SPREADSHEET_ID;  // スプレッドシートIDを指定
  var sheetName = 'chatgpt';  // シート名を指定

  // スプレッドシートを開き、シートを取得
  var spreadsheet = SpreadsheetApp.openById(spreadsheetId);
  var sheet = spreadsheet.getSheetByName(sheetName);

  if (!sheet) {
    Logger.log('シートが見つかりません: ' + sheetName);
    return "シートが見つかりません";
  }

  // 本日の日付を取得
  var today = new Date();
  var todayStr = Utilities.formatDate(today, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  
  // スプレッドシートのデータを取得
  var data = sheet.getDataRange().getValues();
  
  // 本日のリクエスト回数をカウント
  var requestCount = 0;
  for (var i = 1; i < data.length; i++) {
  // スプレッドシートのデータがDateオブジェクトの場合、文字列に変換
  var storedDate = Utilities.formatDate(new Date(data[i][2]), Session.getScriptTimeZone(), 'yyyy-MM-dd');
  
  Logger.log("スプレッドシートの日付: '" + storedDate + "'");
  Logger.log("todayStr: '" + todayStr + "'");
  
  if (storedDate === todayStr) {
    requestCount++;
  }
  
  Logger.log("リクエストカウント: " + requestCount);
}


  // 本日100回以上の場合、サービス終了メッセージを表示
  if (requestCount >= 500) {  // 修正: 100回以上で停止
    Logger.log("本日のリクエスト回数が100回を超えました。サービスを終了します。");
    return "本日のChatGPTサービスは終了しました。";
  }

  // `question`がnullまたは空文字の場合はエラーとして処理
  if (!question || question.trim() === "") {
    Logger.log("エラー: 質問が空です。");
    return "質問が空です。";
  }

  // リクエストのペイロード（質問とモデルの指定）
  var payload = {
    "model": "gpt-4o-mini",  // 使用するモデル
    "messages": [
      {"role": "system", "content": "You are a helpful assistant."},
      {"role": "user", "content": question+"この質問を100字程度で答えてください,もし意味がよくわからない場合は文脈を読み取って返答してください"}
    ]
  };

  // リクエストオプション
  var options = {
    "method": "POST",
    "headers": {
      "Authorization": "Bearer " + apiKey,
      "Content-Type": "application/json"
    },
    "payload": JSON.stringify(payload),
    "muteHttpExceptions": true  // エラーレスポンスも取得するための設定
  };

  try {
    // OpenAI APIにリクエストを送信
    var response = UrlFetchApp.fetch(url, options);
    var jsonResponse = JSON.parse(response.getContentText());

    // APIからの返答を取得
    var reply = jsonResponse.choices[0].message.content;
    Logger.log("ChatGPTの返答: " + reply);

    // 出力時間を取得
    var outputTime = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss');

    // スプレッドシートに質問、返答、時間を記録
    sheet.appendRow([question, reply, todayStr, outputTime]);
    
    return reply;
  } catch (error) {
    Logger.log("エラーが発生しました: " + error);
    return "エラーが発生しました。";
  }
}


function testChatGPT() {
  var question = "OpenAIのAPIとは何ですか？";
  var response = askChatGPT(question);
  Logger.log("質問の答え: " + response);
}

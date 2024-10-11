function postMessage(userID) {
  const url = 'https://api.line.me/v2/bot/message/push';
  const payload = {
    to: userID, // User ID
    'messages': [
      {
        "type": "text",
        "text": "30分以上エアコンがつけっぱなしです。今すぐエアコンを消したい場合は下のメニューから消してください。",
      }
    ]
  };

  const options = {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + token,
      'Content-Type': 'application/json',
    },
    payload: JSON.stringify(payload)
  };

  UrlFetchApp.fetch(url, options);
  
}



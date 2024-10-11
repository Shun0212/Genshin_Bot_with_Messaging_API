function changeMode(type){
  if(type==="HP"){
    return "FIGHT_PROP_HP_PERCENT"
  }else if(type==="熟知"){
    return "FIGHT_PROP_ELEMENT_MASTERY"
  }else if(type==="防御"){
    return "FIGHT_PROP_DEFENSE_PERCENT"
  }else{

    return "FIGHT_PROP_ATTACK_PERCENT"
  }
}

function getFirstAvatarInfo(genshinID,checkmode,infonum) {
  var jsonData = getuserData(genshinID);
  var jsonObject = jsonData;
  var avatarInfoList = jsonObject.avatarInfoList;
  var result ;
    var firstAvatarInfo = avatarInfoList[infonum];
    var mode = changeMode(checkmode)
    result=0
    // 取得したデータをログに出力（適宜処理を追加）
    Logger.log("Avatar ID: " + firstAvatarInfo.avatarId);

    // avatarData の equipList を取り出す
    var equipList = firstAvatarInfo.equipList;

    // 装備ごとに情報をログに出力
    for (var i = 0; i < equipList.length; i++) {
      var equip = equipList[i];

      Logger.log("Equip Item ID: " + equip.itemId);

      if (equip.flat.itemType==="ITEM_RELIQUARY") {
        Logger.log("Reliquary Level: " + equip.reliquary.level);

        // Check if equip.reliquary.flat exists before accessing its properties
        if (equip.flat.reliquaryMainstat) {
          Logger.log("Reliquary Mainstat: " + JSON.stringify(equip.flat.reliquaryMainstat));
        }

        if (equip.flat.reliquarySubstats) {
          var SubList = equip.flat.reliquarySubstats
          for(var t = 0;t<SubList.length;t++){
              var Substats = equip.flat.reliquarySubstats[t]
              Logger.log("Reliquary Substats: " + JSON.stringify(Substats));

              if(Substats.appendPropId==="FIGHT_PROP_CRITICAL"){
                result+=Substats.statValue*2
              }
              if(Substats.appendPropId==="FIGHT_PROP_CRITICAL_HURT"){
                result+=Substats.statValue
              }
              if(Substats.appendPropId==="FIGHT_PROP_HP_PERCENT"&&mode==="FIGHT_PROP_HP_PERCENT"){
                result+=Substats.statValue
              }
              if(Substats.appendPropId==="FIGHT_PROP_ELEMENT_MASTERY"&&mode==="FIGHT_PROP_ELEMENT_MASTERY"){
                result+=Substats.statValue/4
              }
              if(Substats.appendPropId==="FIGHT_PROP_ATTACK_PERCENT"&&mode==="FIGHT_PROP_ATTACK_PERCENT"){
                result+=Substats.statValue
              }
          }
        }

        // 他のリリクエリ情報も同様にログに出力
      } else {
        Logger.log("Reliquary information not available.");
      }
    }

  
  return ((Math.round(result * 10)) / 10)

}

function test3(){
  console.log( getFirstAvatarInfo(879162832,"防御",1));
}



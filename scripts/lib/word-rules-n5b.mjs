// Word looks for N5 part 2 (Step 2): every word chosen by its meaning. Compact notation, one string per word:
//   E:emblem  B:backdrop  S:scene prop (repeatable)  M:motion  R:reveal  P:particle layer (repeatable)
// e.g. 'E:cup B:sky:indoor P:steam'. A value that needs options is given as an object instead of a string.
// The こ / そ / あ / ど words are a system: the ending picks the emblem (れ thing: box, こ place: pin, ちら direction:
// signpost, の "this ...": a pointing hand, んな "this kind": three dots) and the first kana the motion and sky
// (こ near: comes towards you, そ: to the side, あ far: away, ど which: a puzzled tilt).
const parse = (s) => {
  if (typeof s !== 'string') return s;
  const r = {};
  for (const tok of s.split(/\s+/).filter(Boolean)) {
    const [k, ...rest] = tok.split(':'), v = rest.join(':');
    if (k === 'E') r.emblem = v; else if (k === 'B') r.backdrop = v; else if (k === 'M') r.motion = v; else if (k === 'R') r.reveal = v;
    else if (k === 'S') (r.scene ??= []).push(v); else if (k === 'P') (r.particles ??= []).push(v);
  }
  return r;
};
const KOSOADO = { こ: 'M:drift:toward B:sky:morning', そ: 'M:drift:right B:sky:day', あ: 'M:drift:away B:sky:dusk', ど: 'M:tilt B:sky:twilight' };
const ENDING = { れ: 'E:box', こ: 'E:pin', ちら: 'E:signpost', の: 'E:hand', んな: 'E:dots' };
const kosoado = {};
for (const [p, m] of Object.entries(KOSOADO)) for (const [e, em] of Object.entries(ENDING)) kosoado[(p === 'あ' && e === 'こ' ? 'あそ' : p) + e] = `${em} ${m}`;

const TABLE = {
  ...kosoado,
  // food and drink
  食べ物: 'E:bowl P:steam B:sky:indoor', 果物: 'E:flower B:sky:day P:leaves', 飲み物: 'E:cup B:sky:indoor', お茶: { emblem: { type: 'cup', drink: '#7aa63a' }, backdrop: 'sky:indoor', particles: ['steam'] },
  紅茶: { emblem: { type: 'cup', drink: '#8a2a10' }, backdrop: 'sky:golden', particles: ['steam'] }, 茶碗: 'E:bowl B:sky:morning', 卵: 'E:pot B:sky:indoor P:steam', お弁当: 'E:box B:sky:noon',
  朝ごはん: 'E:bowl B:sunrise P:steam', 昼ご飯: 'E:bowl B:sky:noon', 夕飯: 'E:bowl B:sky:sunset P:steam', 御飯: 'E:bowl B:sky:indoor P:steam', 晩御飯: 'E:bowl B:sky:night P:steam',
  野菜: 'E:leaf S:field B:sky:day', 砂糖: 'E:spoon P:sparks B:sky:indoor', 塩: 'E:spoon P:snow B:sky:indoor', 牛乳: { emblem: { type: 'cup', drink: '#f4f4f0' }, backdrop: 'sky:morning' },
  牛肉: 'E:cow B:sky:indoor P:steam', 豚肉: 'E:plate B:sky:indoor P:steam', 鶏肉: 'E:bird B:sky:indoor P:steam', パン: 'E:plate B:sky:morning', バター: 'E:knife B:sky:morning',
  コーヒー: { emblem: { type: 'cup', drink: '#4a2a10' }, backdrop: 'sky:indoor', particles: ['steam'] }, カレー: 'E:bowl P:steam B:sky:golden', お菓子: 'E:box P:hearts B:sky:dawn',
  飴: 'E:gem B:sky:dawn P:sparks', お酒: { emblem: { type: 'cup', drink: '#f0e8c0' }, backdrop: 'sky:night', particles: ['bubbles'] }, 醤油: 'E:pot B:sky:indoor', 美味しい: 'E:spoon P:hearts B:sky:golden',
  まずい: 'E:frown B:sky:storm M:shake', 甘い: 'E:gem P:hearts B:sky:dawn', 辛い: 'P:flames B:halo E:bowl', 料理: 'E:pot S:room:kitchen B:sky:indoor P:steam', 食堂: 'E:bowl S:room B:sky:indoor',
  喫茶店: { emblem: { type: 'cup', drink: '#4a2a10' }, scene: ['room:shop'], backdrop: 'sky:indoor' }, レストラン: 'E:plate S:room:shop B:sky:night',
  // tableware and things at home
  箸: 'E:bowl B:sky:indoor', ナイフ: 'E:knife B:sky:day', フォーク: 'E:plate B:sky:day', スプーン: 'E:spoon B:sky:day', コップ: { emblem: { type: 'cup', drink: '#9fd0ff' }, backdrop: 'sky:day' },
  カップ: 'E:cup B:sky:morning', お皿: 'E:plate B:sky:indoor', 灰皿: 'E:plate P:steam B:sky:night', 花瓶: 'E:flower S:room B:sky:indoor', 冷蔵庫: 'P:snow S:room:kitchen B:sky:indoor E:box',
  台所: 'S:room:kitchen B:sky:indoor E:pot', 机: 'E:book S:room B:sky:indoor', 椅子: 'S:room B:sky:indoor M:bounce', テーブル: 'E:plate S:room B:sky:indoor', ベッド: 'E:bed B:sky:night P:motes', 本棚: 'E:book S:room M:count:3',
  鍵: 'E:house B:sky:night P:sparks', 窓: 'E:window B:sky:day', ドア: 'S:gate B:sky:day', 戸: 'S:gate B:sky:dusk', 門: 'S:gate B:sky:morning', 玄関: 'S:gate S:room B:sky:indoor', 廊下: 'S:room S:road B:sky:indoor',
  部屋: 'S:room B:sky:indoor E:bed', テレビ: 'E:film B:sky:indoor P:motes', ラジオ: 'E:speaker B:sky:indoor P:notes', ストーブ: 'P:embers B:halo S:room', シャワー: 'P:rain P:bubbles B:sky:indoor', お風呂: 'P:steam E:onsen B:sky:indoor',
  石鹸: 'P:bubbles B:sky:day E:hand', トイレ: 'S:room B:sky:indoor E:pin', お手洗い: 'E:hand P:bubbles B:sky:indoor', マッチ: 'P:flames B:sky:night', たばこ: 'P:steam B:sky:dusk', カレンダー: 'E:calendar B:sky:day',
  時計: 'E:clock B:sky:day', 箱: 'E:box B:sky:day', 財布: 'E:yen P:coins B:sky:day', かばん: 'E:bag B:sky:morning', テープ: 'E:film B:sky:indoor', テープレコーダー: 'E:speaker B:sky:indoor P:notes',
  レコード: 'E:film P:notes B:sky:night', フィルム: 'E:camera B:sky:day', カメラ: 'E:camera B:sky:day P:sparks', ギター: 'E:note P:notes B:sky:golden', 電話: 'E:phone B:sky:indoor',
  // clothes
  上着: 'E:shirt B:sky:snow', 帽子: { emblem: 'person', motion: 'bounce', backdrop: 'sky:day', particles: ['wind'] }, 靴下: 'E:shoe B:sky:indoor', 背広: { emblem: { type: 'shirt', color: '#3a3a50' }, backdrop: 'sky:morning' },
  シャツ: 'E:shirt B:sky:day', ワイシャツ: { emblem: { type: 'shirt', color: '#f0f0f4' }, backdrop: 'sky:morning' }, ネクタイ: { emblem: { type: 'shirt', color: '#c03030' }, backdrop: 'sky:indoor' },
  セーター: { emblem: { type: 'shirt', color: '#d06030' }, backdrop: 'sky:snow', particles: ['snow'] }, スカート: { emblem: { type: 'shirt', color: '#e070a0' }, backdrop: 'sky:dawn', motion: 'sway' },
  ズボン: { emblem: { type: 'shirt', color: '#405080' }, backdrop: 'sky:day', motion: 'walk' }, コート: { emblem: { type: 'shirt', color: '#8a6040' }, backdrop: 'sky:snow', particles: ['wind'] },
  ポケット: 'E:hand B:sky:day', ボタン: 'E:dots:1 B:sky:day', ハンカチ: 'E:hand B:sky:dawn', 洋服: 'E:shirt S:room:shop B:sky:indoor', 眼鏡: 'E:glasses B:sky:day',
  着る: 'E:shirt M:drift:down B:sky:morning', はく: 'E:shoe M:drift:down B:sky:day', かぶる: { emblem: 'person', motion: { type: 'drift', dir: 'down' }, backdrop: 'sky:noon' }, 脱ぐ: 'E:shirt M:drift:up B:sky:indoor', 締める: 'E:bag M:pulse B:sky:day',
  // people
  家族: 'E:house P:hearts B:sky:dusk', 子供: 'E:person M:bounce B:sky:noon', 友達: 'E:hand P:hearts B:sky:dawn', 自分: 'E:mirror B:sky:morning', お兄さん: { emblem: { type: 'person', color: '#5a9ae8', size: 1.3 }, backdrop: 'sky:day' },
  お姉さん: { emblem: { type: 'person', color: '#ff7aa8', size: 1.3 }, backdrop: 'sky:day' }, 妹: { emblem: { type: 'person', color: '#ff7aa8', size: 0.8 }, motion: 'bounce', backdrop: 'sky:dawn' },
  兄弟: 'E:person M:count:2 B:sky:day', 両親: 'E:person P:hearts B:sky:golden M:count:2', おばあさん: { emblem: { type: 'person', color: '#c0b0d0' }, backdrop: 'sky:golden' }, おじいさん: { emblem: { type: 'person', color: '#a0b0c0' }, backdrop: 'sky:golden', motion: 'walk' },
  おばさん: { emblem: { type: 'person', color: '#e090a0' }, backdrop: 'sky:dusk' }, 奥さん: 'E:ring B:sky:dawn P:hearts', 結婚: 'E:ring P:petals B:sky:dawn', 医者: 'E:hospital B:sky:day', 警官: 'E:stop B:sky:day',
  おまわりさん: 'E:stop B:sky:dusk M:walk', 生徒: 'E:book S:room:classroom B:sky:indoor', 留学生: 'E:globe B:sky:morning', 皆さん: 'E:person M:count:3 B:sky:day', みんな: 'E:person M:count:4 B:sky:noon',
  大勢: 'P:footprints E:person M:count:5 B:sky:day', あなた: 'E:hand M:drift:toward B:sky:day', どなた: 'E:question B:sky:twilight', 誰か: 'E:question M:tilt B:sky:dusk', 二十歳: 'E:trophy P:sparks B:sky:dawn',
  // body
  歯: 'E:gem B:sky:day', 顔: 'E:mask B:sky:morning', 鼻: 'E:mask M:pulse B:sky:day', 頭: 'E:lightbulb B:sky:day', お腹: 'E:bowl M:pulse B:sky:indoor', 声: 'E:speech P:notes B:sky:day', 痛い: 'E:bolt M:shake B:sky:storm',
  風邪: 'E:thermometer M:shake B:sky:snow', 病気: 'E:pill B:sky:storm', 薬: 'E:pill B:sky:day', 疲れる: 'E:zzz M:sink B:sky:dusk', 元気: 'E:sun M:bounce B:sky:noon', 丈夫: 'E:shield B:sky:day', 大丈夫: 'E:check B:sky:day',
  // places
  町: 'S:road E:house B:sky:dusk', 村: 'S:field E:house B:sky:morning', 公園: 'S:tree B:sky:day P:leaves', 海: 'S:ripples B:sky:day E:boat', 池: 'S:ripples B:sky:forest', 橋: 'S:river S:bridge B:sky:day',
  銀行: 'E:yen P:coins B:sky:day', 郵便局: 'E:letter B:sky:day', ポスト: 'E:letter M:bounce B:sky:day', 地下鉄: 'E:train B:sky:night M:drift:down', 交番: 'E:stop B:sky:dusk', 八百屋: 'E:leaf S:room:shop B:sky:indoor',
  ホテル: 'E:bed B:sky:night', アパート: 'E:house M:count:3 B:sky:day', デパート: 'E:bag S:room:shop B:sky:indoor', 図書館: 'E:book S:room B:sky:indoor', 大使館: 'E:flag:japan B:sky:day', 映画館: 'E:film B:sky:night P:motes',
  病院: 'E:hospital B:sky:day', 教室: 'S:room:classroom B:sky:indoor', 交差点: 'S:road E:swap B:sky:day', 建物: 'E:museum B:sky:day', 家庭: 'E:house S:room B:sky:indoor', 隣: 'E:house M:drift:right B:sky:day',
  プール: 'S:ripples P:bubbles B:sky:noon', 角: 'S:road M:turn B:sky:day', 辺: 'E:pin S:field B:sky:day', 他: 'E:signpost M:drift:right B:sky:day', 向こう: 'S:river M:drift:away B:sky:day', 地図: 'S:field E:pin B:sky:day',
  // transport and moving
  自動車: 'E:car S:road B:sky:day', 自転車: 'E:bike S:road B:sky:morning', バス: 'E:car S:road B:sky:morning M:bounce', タクシー: { emblem: { type: 'car', color: '#ffd030' }, scene: ['road'], backdrop: 'sky:night' },
  飛行機: 'E:plane B:sky:noon M:fly P:wind', エレベーター: 'M:drift:up E:arrow:up S:room B:sky:indoor', 乗る: 'E:train M:bounce B:sky:day', 着く: 'E:flag M:drift:down B:sky:dusk', 走る: 'P:footprints M:walk B:sky:morning P:wind',
  散歩: 'P:footprints S:tree B:sky:day M:walk', 出かける: 'E:bag M:drift:right B:sky:morning', 帰る: 'E:house M:drift:left B:sky:dusk', 止まる: 'E:stop B:sky:day M:sink', 曲がる: 'S:road M:turn B:sky:day', まっすぐ: 'S:road M:drift:away B:sky:day',
  渡る: 'S:river S:bridge M:drift:right B:sky:day', 渡す: 'E:hand M:drift:right B:sky:day', 登る: 'S:mountains M:drift:up B:sky:day', 降りる: 'E:stairs M:drift:down B:sky:day', 降る: 'P:rain B:sky:storm', 旅行: 'E:suitcase S:road B:sky:morning',
  遠い: 'S:road M:shrink E:arrow:away B:sky:golden', 近い: 'M:drift:toward E:arrow:toward B:sky:day', 近く: 'E:pin M:drift:toward B:sky:day', 遅い: 'E:snail B:sky:dusk', 早い: 'E:alarm B:sunrise',
  // doing
  切る: 'E:knife M:split B:sky:day', 洗う: 'P:bubbles E:hand B:sky:day', 洗濯: 'P:bubbles E:shirt B:sky:day', 掃除: 'P:dust E:hand B:sky:indoor S:room', 消す: 'B:sky:night M:vanish', 消える: 'M:vanish B:sky:dusk P:mist',
  開ける: 'S:gate B:sky:day', 閉める: { scene: [{ type: 'gate', close: true }], backdrop: 'sky:night' }, 閉まる: { scene: [{ type: 'gate', close: true }], backdrop: 'sky:dusk' }, 呼ぶ: 'E:speech M:shove:toward B:sky:day',
  待つ: 'E:clock M:float B:sky:dusk', 教える: 'S:room:classroom E:pen B:sky:indoor', 習う: 'E:book B:sky:morning', 練習: 'E:repeat B:sky:day', 勉強: 'E:book B:sky:indoor P:motes', 覚える: 'E:lightbulb B:sky:twilight',
  忘れる: 'M:vanish E:question B:sky:dusk', 寝る: 'E:zzz P:motes B:sky:night', 起きる: 'E:alarm M:stand B:sunrise', 座る: 'S:room M:sink B:sky:indoor', 立つ: 'M:stand B:sky:day', 頼む: 'E:hand M:bow B:sky:day',
  借りる: 'E:book M:drift:toward B:sky:day', 貸す: 'E:book M:drift:right B:sky:day', 返す: 'E:boomerang B:sky:day', 引く: 'E:bow M:shove:left B:sky:day', 押す: 'E:hand M:shove:right B:sky:day', 置く: 'E:box M:drift:down B:sky:indoor',
  作る: 'E:hammer B:sky:indoor', 使う: 'E:wrench B:sky:day', 持つ: 'E:bag B:sky:day', 取る: 'E:hand M:shove:left B:sky:day', 撮る: 'E:camera B:sky:day', 貼る: 'E:letter R:stamp B:sky:day', 掛ける: 'M:hang S:room B:sky:indoor',
  並ぶ: 'E:person M:count:4 B:sky:day', 並べる: 'S:lanterns:5 B:sky:indoor', 歌う: 'E:mic P:notes B:sky:golden', 弾く: 'E:note P:notes B:sky:twilight', 遊ぶ: 'E:blocks M:bounce B:sky:noon', 泳ぐ: 'S:ripples M:swim B:sky:noon',
  浴びる: 'P:rain P:bubbles B:sky:indoor', 吸う: 'P:wind M:pulse B:sky:day', 吹く: 'P:wind P:leaves B:sky:day', 咲く: 'E:flower P:petals B:sky:dawn', 鳴く: 'E:bird P:notes B:sky:forest', 飛ぶ: 'E:bird M:fly B:sky:noon',
  磨く: 'P:sparks E:shoe B:sky:day', 働く: 'E:briefcase B:sky:morning', 勤める: 'E:briefcase S:room B:sky:indoor', 困る: 'E:question M:shake B:sky:storm', 答える: 'E:speech B:sky:day', 死ぬ: 'P:leaves B:sky:dusk M:sink',
  終わる: 'E:flag:finish B:sky:sunset', 始まる: 'E:flag B:sky:dawn', 無くす: 'M:vanish E:question B:sky:dusk', 曇る: 'E:cloud P:mist B:sky:snow', 晴れる: 'E:sun M:drift:up B:sky:noon', 生まれる: 'P:petals E:heart B:sky:dawn M:grow',
  // grammar words (verbs that do the work of a sentence)
  する: 'E:hand M:bounce B:sky:day', やる: 'E:hand M:shove:right B:sky:noon', なる: 'M:grow P:sparks B:sky:dawn', できる: 'E:check B:sky:noon', いる: 'E:person M:float B:sky:day', 在る: 'E:box B:sky:day',
  ない: 'M:vanish B:sky:night', かかる: 'E:clock B:sky:day', つける: 'E:lightbulb B:sky:night', 要る: 'E:exclaim B:sky:day',
  // how things are
  大切: 'E:heart M:pulse B:sky:golden', 色々: 'E:rainbow B:sky:day', 茶色: { emblem: { type: 'splash', color: '#8a5020' }, backdrop: 'sky:day' }, 黄色: { emblem: { type: 'splash', color: '#ffd800' }, backdrop: 'sky:day' },
  黄色い: { emblem: { type: 'flower', color: '#ffd800' }, backdrop: 'sky:day' }, 赤い: { emblem: { type: 'splash', color: '#e02020' }, backdrop: 'sky:day' }, 青い: { emblem: { type: 'splash', color: '#2a7aff' }, backdrop: 'sky:day' },
  黒い: { emblem: { type: 'splash', color: '#16161e' }, backdrop: 'sky:snow' }, 緑: { emblem: 'leaf', backdrop: 'sky:forest' }, 本当: 'E:check B:sky:day', 難しい: 'E:question M:shake B:sky:storm', 易しい: 'E:check M:bounce B:sky:noon',
  欲しい: 'E:bag P:hearts M:pulse B:sky:dawn', 楽しい: 'P:notes M:bounce B:sky:golden', 忙しい: 'E:clock M:shake B:sky:day', 静か: 'E:zzz P:motes B:sky:night', 有名: 'E:trophy P:sparks B:sky:golden', 嫌い: 'E:frown M:shake B:sky:storm',
  冷たい: 'P:snow E:thermometer B:sky:snow', 寒い: 'P:snow M:shake B:sky:snow', 暑い: 'E:sun B:halo P:motes', 熱い: 'P:steam E:cup B:halo', 暖かい: 'E:sun P:petals B:sky:golden', 温い: { emblem: { type: 'thermometer', level: 0.45 }, backdrop: 'sky:indoor' },
  涼しい: 'P:wind P:leaves B:sky:morning', 明るい: 'E:lightbulb P:sparks B:sky:noon', 暗い: 'B:sky:night M:shrink', 若い: 'P:sparks M:bounce B:sky:dawn', 弱い: 'M:sink B:sky:dusk', 強い: 'E:dumbbell M:pulse B:sky:noon',
  低い: 'M:shrink B:sky:day', 短い: { motion: { type: 'stretch', axis: 'x', to: 0.7 }, backdrop: 'sky:day' }, 細い: { motion: { type: 'stretch', axis: 'x', to: 0.75 }, backdrop: 'sky:dawn' }, 太い: { motion: { type: 'stretch', axis: 'x', to: 1.3 }, backdrop: 'sky:day' },
  広い: { motion: { type: 'stretch', axis: 'x', to: 1.35 }, scene: ['field'], backdrop: 'sky:day' }, 狭い: { motion: { type: 'stretch', axis: 'x', to: 0.7 }, scene: ['room'], backdrop: 'sky:indoor' },
  厚い: 'E:book M:grow B:sky:day', 薄い: 'E:sheet M:shrink B:sky:day', 重い: 'E:weight M:sink B:sky:day', 軽い: 'M:float P:motes B:sky:day', 丸い: 'E:pie:0 M:spin B:sky:day', 同じ: 'E:equals B:sky:day',
  汚い: { emblem: { type: 'splash', color: '#6a4a28' }, backdrop: 'sky:day', particles: ['dust'] }, 綺麗: 'P:sparks E:flower B:sky:dawn', 可愛い: 'P:hearts E:heart B:sky:dawn', 面白い: 'E:speech P:notes M:bounce B:sky:golden',
  つまらない: 'E:zzz B:sky:dusk M:sink', うるさい: 'E:speaker M:shake B:sky:storm', にぎやか: 'P:notes S:road B:sky:golden', 危ない: 'E:exclaim M:shake B:sky:storm', 便利: 'E:wrench P:sparks B:sky:day', 結構: 'E:check B:sky:golden',
  りっぱ: 'E:trophy B:sky:golden', いい: 'E:heart B:sky:noon', 暇: 'E:zzz B:sky:golden', 大変: 'E:exclaim M:shake B:sky:dusk',
  // time
  今朝: 'B:sunrise M:pulse', 毎朝: 'B:sunrise M:count:3', 毎晩: 'E:crescent M:count:3 B:sky:night', 今晩: 'E:crescent M:pulse B:sky:twilight', 昨日: 'E:arrow:left B:sky:dusk M:drift:left', 一昨日: 'E:arrow:left M:drift:left B:sky:twilight P:motes',
  明日: 'E:arrow:right B:sky:dawn M:drift:right', 去年: 'E:arrow:left P:leaves B:sky:golden', 再来年: 'E:arrow:right M:count:2 B:sky:dawn', おととし: 'E:arrow:left M:count:2 B:sky:golden', 誕生日: 'P:sparks E:gem B:sky:night',
  冬: 'P:snow B:sky:snow', 春: 'P:petals B:sky:dawn', 秋: 'P:leaves B:sky:golden', 夏休み: 'E:sun S:ripples B:sky:noon', 夕方: 'B:sky:sunset E:crescent', 初め: 'E:flag B:sky:dawn', 初めて: 'P:sparks B:sky:dawn M:pulse',
  次: 'E:arrow:right M:drift:right B:sky:day', 時々: 'E:clock M:blink', 丁度: 'E:clock M:pulse B:sky:day', 段々: 'E:stairs M:grow B:sky:day', いつ: 'E:clock M:tilt B:sky:twilight', いつも: 'E:repeat B:sky:noon', もう: 'E:check B:sky:dusk',
  まだ: 'E:snail B:sky:day', すぐに: 'E:bolt B:sky:noon', また: 'E:repeat M:count:2 B:sky:day', 一番: 'E:trophy B:sky:golden', 授業: 'S:room:classroom E:book B:sky:indoor', テスト: 'E:sheet B:sky:indoor', 宿題: 'E:sheet B:sky:night',
  // words and paper
  英語: 'E:globe P:kana B:sky:day', 言葉: 'P:kana E:speech B:sky:day', 漢字: 'P:kana E:pen B:sky:indoor', 字引: 'E:book P:kana B:sky:indoor', 辞書: 'E:book P:kana B:sky:morning', 作文: 'E:pen B:sky:indoor',
  文章: 'E:sheet P:kana B:sky:day', 手紙: 'E:letter B:sky:day', 葉書: 'E:letter P:leaves B:sky:day', 封筒: 'E:letter B:sky:indoor', 切手: 'E:letter P:sparks B:sky:day', 切符: 'E:ticket B:sky:day',
  雑誌: 'E:book B:sky:day', ノート: 'E:book B:sky:day', ページ: 'E:book B:sky:indoor', 鉛筆: 'E:pen B:sky:day', 万年筆: 'E:pen B:sky:golden', ペン: 'E:pen B:sky:day', ボールペン: 'E:pen B:sky:morning',
  かたかな: { particles: [{ type: 'kana', color: '#9c8cff' }], backdrop: 'sky:night' }, 平仮名: 'P:kana B:sky:dawn', 意味: 'E:lightbulb B:sky:twilight', 質問: 'E:question B:sky:day', 問題: 'E:question B:sky:indoor',
  番号: 'E:ticket B:sky:day', ニュース: 'E:globe B:sky:morning', 映画: 'E:film B:sky:night', 写真: 'E:camera B:sky:day', 絵: 'E:frame B:sky:day', 音楽: 'E:note P:notes B:sky:golden',
  // nature and animals
  雪: 'P:snow B:sky:snow', 鳥: 'E:bird B:sky:forest', 猫: 'M:wag B:sky:day E:heart', 動物: 'E:cow B:sky:forest', ペット: 'E:heart M:bounce B:sky:day', 晴れ: 'E:sun B:sky:noon', 曇り: 'E:cloud B:sky:snow',
  // greetings and little words
  はい: 'E:check B:sky:day', ええ: 'E:check B:sky:morning', いいえ: 'E:cross B:sky:dusk', ああ: 'E:exclaim B:sky:day', さあ: 'E:hand M:shove:right B:sky:morning', どうぞ: 'E:hand M:bow B:sky:golden', どうも: 'E:heart M:bow B:sky:day',
  もしもし: 'E:phone B:sky:indoor', では: 'E:hand B:sky:dusk', じゃ: 'E:hand M:wave B:sky:day', それでは: 'E:hand B:sky:twilight', それから: 'E:arrow:right B:sky:day', そうして: 'E:arrow:right B:sky:morning', しかし: 'E:swap B:sky:dusk',
  でも: 'E:swap B:sky:day', とても: 'E:exclaim M:grow B:sky:noon', ちょっと: 'E:dots:1 M:shrink B:sky:day', もっと: 'E:plus M:grow B:sky:day', よく: 'E:check M:count:2 B:sky:day', 沢山: 'E:dots:6 B:sky:day', 全部: 'E:pie:0 B:sky:day',
  なぜ: 'E:question B:sky:dusk', どうして: 'E:question M:tilt B:sky:storm', どう: 'E:question B:sky:day', いかが: 'E:cup B:sky:indoor', いくら: 'E:tag B:sky:day', いくつ: 'E:dots:3 M:tilt B:sky:day', そう: 'E:check M:bow B:sky:day',
  余り: 'E:pie B:sky:day', 一緒: 'E:person M:count:2 P:hearts B:sky:day', たて: { motion: { type: 'stretch', axis: 'y', to: 1.3 }, backdrop: 'sky:day' }, 横: { motion: { type: 'stretch', axis: 'x', to: 1.3 }, backdrop: 'sky:day' },
  メートル: 'E:ruler B:sky:day', キロ: 'E:weight B:sky:day', グラム: 'E:scale B:sky:day', 零: 'E:pie:0 M:vanish B:sky:night', ゼロ: { emblem: { type: 'pie', part: 0, color: '#f0f0f0' }, motion: 'vanish', backdrop: 'sky:snow' },
  買い物: 'E:bag S:room:shop B:sky:indoor', 荷物: 'E:suitcase B:sky:day', そば: 'E:pin M:drift:toward B:sky:day', 傘: 'E:umbrella P:rain B:sky:storm', うち: 'E:house S:room B:sky:indoor',
  階段: 'E:stairs B:sky:day', 差す: 'E:umbrella P:rain B:sky:dusk', 違う: 'E:cross M:shake B:sky:day', 売る: 'E:tag P:coins B:sky:golden', 住む: 'E:house S:room B:sky:night', 悪い: 'E:frown B:sky:storm M:shake',
  スポーツ: 'E:dumbbell M:bounce B:sky:noon', パーティー: 'P:notes P:sparks B:sky:night', クラス: 'S:room:classroom E:person B:sky:indoor', 仕事: 'E:briefcase B:sky:morning',
};

// the table above with the strings parsed
export const BY_WORD_N5B = Object.fromEntries(Object.entries(TABLE).map(([w, s]) => [w, parse(s)]));

// AUTHOR:   SongErwei
// ROLE:    	
// CREATED:  2016-11-22 10:22:54
 
// http://api.xxtao.com/index.php?r=conf/dict
// 理论上来说，应该取api的该接口，以保证数据最新。但，那样会让代码稍复杂，似无必要。跟Los几番沟通，他坚持服务端不动。
// 那我只好参照此时的接口数据自己弄一个字典。以丧失代码永远正确的代价，换取代码的简洁

var api_dict = {
  demand: {
    type: {
      "0": "其它", 
      "1": "门头屏", 
      "2": "户外广告屏", 
      "3": "信息告示屏", 
      "4": "舞台用屏", 
      "5": "室内高清屏"
    },
    loc: {
      "1": "户外",
      "2": "室内",
      "3": "半户外"
    }, 
    color: {
      "1": "单色",
      "2": "双色",
      "3": "全彩"
    }
  },
} 

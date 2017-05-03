define(function() {
	return [
        {
            // 没有排期
            user_name: "李四",
            city_name: "深圳",
            longitude: "113.907306",
            latitude: "22.527573"
        },
        {
            // 一个排期 
            user_name: "二哥（遮住灰色钉子）",
            city_name: "深圳",
            longitude: "113.907306",
            latitude: "22.527573",

            projects: [
                {
                    start_date: "2017-06-01",        
                    end_date: "2017-06-10",        

                    city_name: "昆明",
                    project_name: "昆明yyy",
                    longitude: "102.712938",
                    latitude: "25.038912",
                }
            ]
        },
        {
            // 排期在未来
            user_name: "张三(任务统统在未来)",
            city_name: "北京",
            longitude: "116.396702",
            latitude: "39.917773",

            projects: [
                {
                    start_date: "2017-05-26",        
                    end_date: "2017-05-28",        

                    city_name: "西安",
                    project_name: "西安xxx",
                    longitude: "108.945964",
                    latitude: "34.269558",
                },
                {
                    start_date: "2017-06-01",        
                    end_date: "2017-06-10",        

                    city_name: "昆明",
                    project_name: "昆明yyy",
                    longitude: "102.712938",
                    latitude: "25.038912",
                }
            ]
        },
        {
            // 当前处于任务中
            user_name: "王麻子(当前正执行)",
            city_name: "武汉",
            longitude: "114.291019",
            latitude: "30.579196",

            projects: [
                {
                    start_date: "2017-04-22",        
                    end_date: "2017-05-28",        

                    city_name: "西安",
                    project_name: "西安xxx",
                    longitude: "108.945964",
                    latitude: "34.269558",
                },
                {
                    start_date: "2017-06-01",        
                    end_date: "2017-06-10",        

                    city_name: "武汉",
                    project_name: "武汉xxx",
                    longitude: "114.291019",
                    latitude: "30.579196",
                },
            ]
        },
        {
            // 有已完成的任务
            user_name: "牛三斤(有任务完成)",
            city_name: "武汉",
            longitude: "114.291019",
            latitude: "30.579196",

            projects: [
                {
                    start_date: "2017-04-2",        
                    end_date: "2017-04-22",        

                    city_name: "武汉",
                    project_name: "武汉xxx",
                    longitude: "114.291019",
                    latitude: "30.579196",
                },
                {
                    start_date: "2017-06-10",        
                    end_date: "2017-06-20",        

                    city_name: "郑州",
                    project_name: "郑州xxx",
                    longitude: "113.657859",
                    latitude: "34.755872",
                },
            ]
        }
    ]
});

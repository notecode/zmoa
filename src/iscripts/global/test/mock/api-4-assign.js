define(function() {
    return{
        all_service_user_list: {
            1: {
                name: "test1",
                city_name: "深圳",
                distance: "1234",
            },
            2: {
                name: "test2",
                city_name: "上海",
                distance: "122",
            },
            3: {
                name: "test3",
                city_name: "广州",
                distance: "1200",
            }
        },
        date_serving_user_list: [
            {
                date: "2017-04-26",
                serving_user_info_list: [ ]
            },
            {
                date: "2017-04-27",
                serving_user_info_list: [ ]
            },
            {
                date: "2017-04-28",
                serving_user_info_list: [ ]
            },
            {
                date: "2017-04-29",
                serving_user_info_list: [
                    {
                        user_id: "3",
                        city: "北京",
                        start_date: "2017-04-24",
                        end_date: "2017-04-29"
                    }
                ]
            },
            {
                date: "2017-04-30",
                serving_user_info_list: [
                    {
                        user_id: "3",
                        city: "广州",
                        start_date: "2017-04-24",
                        end_date: "2017-04-30",
                        distance: "10",
                    },
                    {
                        user_id: "1",
                        city: "济南",
                        start_date: "2017-04-24",
                        end_date: "2017-04-30",
                        distance: "1",
                    },
                    {
                        user_id: "1",
                        city: "济南",
                        start_date: "2017-04-24",
                        end_date: "2017-04-30"
                    },
                    {
                        user_id: "2",
                        city: "济南",
                        start_date: "2017-04-24",
                        end_date: "2017-04-30"
                    }
                ]
            },
            {
                date: "2017-05-01",
                serving_user_info_list: [ ]
            }
        ]
    } 
})

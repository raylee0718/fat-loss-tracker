export const sampleData = {
  dailyLogs: [
    {
      date: "2026-05-03",
      weight: 80.6,
      breakfast: "地瓜",
      lunch: "雞胸便當",
      dinner: "牛肉湯、青菜",
      snacks: "香蕉",
      waterMl: 2200,
      sleepStart: "00:20",
      wakeTime: "07:20",
      sleepHours: 7
    },
    {
      date: "2026-05-04",
      weight: 80.2,
      breakfast: "希臘優格",
      lunch: "滷味、青菜",
      dinner: "沙拉",
      snacks: "",
      waterMl: 2050,
      sleepStart: "23:30",
      wakeTime: "07:00",
      sleepHours: 7.5
    },
    {
      date: "2026-05-05",
      weight: 80.4,
      breakfast: "茶葉蛋",
      lunch: "舒肥雞胸便當",
      dinner: "雞腿、燙青菜",
      snacks: "布丁",
      waterMl: 1600,
      sleepStart: "01:30",
      wakeTime: "08:30",
      sleepHours: 7
    },
    {
      date: "2026-05-06",
      weight: 79.9,
      breakfast: "香蕉、咖啡",
      lunch: "雞肉飯、青菜",
      dinner: "雞胸沙拉",
      snacks: "",
      waterMl: 2300,
      sleepStart: "23:50",
      wakeTime: "07:10",
      sleepHours: 7.3
    },
    {
      date: "2026-05-07",
      weight: 79.7,
      breakfast: "蛋餅、豆漿",
      lunch: "滷肉飯",
      dinner: "蔬菜、燙青菜",
      snacks: "",
      waterMl: 2100,
      sleepStart: "00:10",
      wakeTime: "07:00",
      sleepHours: 6.8
    },
    {
      date: "2026-05-08",
      weight: 79.5,
      breakfast: "茶葉蛋、無糖豆漿",
      lunch: "雞胸沙拉",
      dinner: "",
      snacks: "",
      waterMl: 1250,
      sleepStart: "23:30",
      wakeTime: "07:00",
      sleepHours: 7.5
    }
  ],
  workoutLogs: [
    {
      id: "workout-sample-1",
      date: "2026-05-06",
      exercises: [
        {
          id: "exercise-sample-1",
          name: "槓鈴臥推",
          sets: [
            { id: "set-sample-1", setType: "熱身組", weightKg: "20", reps: "12", restSeconds: "60" },
            { id: "set-sample-2", setType: "正式組", weightKg: "40", reps: "8", restSeconds: "90" },
            { id: "set-sample-3", setType: "正式組", weightKg: "45", reps: "6", restSeconds: "120" }
          ]
        },
        {
          id: "exercise-sample-2",
          name: "坐姿划船",
          sets: [
            { id: "set-sample-4", setType: "正式組", weightKg: "35", reps: "10", restSeconds: "90" },
            { id: "set-sample-5", setType: "正式組", weightKg: "40", reps: "8", restSeconds: "90" }
          ]
        }
      ]
    },
    {
      id: "workout-sample-2",
      date: "2026-05-08",
      exercises: [
        {
          id: "exercise-sample-3",
          name: "槓鈴臥推",
          sets: [
            { id: "set-sample-6", setType: "熱身組", weightKg: "20", reps: "12", restSeconds: "60" },
            { id: "set-sample-7", setType: "正式組", weightKg: "42.5", reps: "8", restSeconds: "90" },
            { id: "set-sample-8", setType: "正式組", weightKg: "45", reps: "7", restSeconds: "120" }
          ]
        }
      ]
    }
  ],
  bodyMeasurements: [
    {
      id: "body-sample-1",
      date: "2026-05-08",
      waistCm: 88.8,
      hipCm: 99,
      chestCm: 98,
      thighCm: 57
    }
  ],
  settings: {
    startingWeight: "",
    targetWeight: "75",
    heightCm: 172,
    dailyWaterGoal: 2000,
    waterQuickAmounts: [250, 500, 750],
    dailySleepGoal: 7
  }
};

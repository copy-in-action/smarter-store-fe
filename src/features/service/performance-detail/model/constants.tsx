export const performanceSchedules = [
  {
    id: 18,
    showDateTime: "2025-12-26T09:39:00",
    ticketOptions: [
      {
        seatGrade: "R",
        remainingSeats: 10,
      },
      {
        seatGrade: "S",
        remainingSeats: 10,
      },
      {
        seatGrade: "A",
        remainingSeats: 10,
      },
      {
        seatGrade: "B",
        remainingSeats: 10,
      },
    ],
  },
  {
    id: 18,
    showDateTime: "2025-12-26T09:39:00",
    ticketOptions: [
      {
        seatGrade: "R",
        remainingSeats: 10,
      },
      {
        seatGrade: "S",
        remainingSeats: 10,
      },
      {
        seatGrade: "A",
        remainingSeats: 10,
      },
      {
        seatGrade: "B",
        remainingSeats: 10,
      },
    ],
  },
  {
    id: 20,
    showDateTime: "2025-12-27T14:23:00",
    saleStartDateTime: "2025-12-24T14:23:00",
    createdAt: "2025-12-23T23:23:42.463545",
    updatedAt: "2025-12-23T23:23:42.463545",
    ticketOptions: [
      {
        id: 24,
        seatGrade: "R",
        price: 0,
      },
      {
        id: 25,
        seatGrade: "S",
        price: 90000,
      },
      {
        id: 26,
        seatGrade: "A",
        price: 70000,
      },
      {
        id: 27,
        seatGrade: "B",
        price: 50000,
      },
    ],
  },
  {
    id: 21,
    showDateTime: "2025-12-29T14:23:00",
    saleStartDateTime: "2025-12-24T14:23:00",
    createdAt: "2025-12-23T23:23:52.791747",
    updatedAt: "2025-12-23T23:23:52.791747",
    ticketOptions: [
      {
        id: 28,
        seatGrade: "R",
        price: 100000,
      },
      {
        id: 29,
        seatGrade: "S",
        price: 90000,
      },
      {
        id: 30,
        seatGrade: "A",
        price: 0,
      },
      {
        id: 31,
        seatGrade: "B",
        price: 50000,
      },
    ],
  },
];

export const performanceShowDateTimes = performanceSchedules.map(
  (schedules) => schedules.showDateTime,
);

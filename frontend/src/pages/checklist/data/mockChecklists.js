export const mockChecklists = {
  "1": {
    id: "1",
    title: "Du học bằng thạc sĩ Mỹ",
    deadline: "2025-06-30",
    summary: { completed: 3, total: 9 },
    categories: [
      {
        id: "personal",
        title: "Giấy tờ tuỳ thân",
        items: [
          { id: "p1", label: "Hộ chiếu", status: "completed", required: true, completedDate: "14/4" },
          { id: "p2", label: "Ảnh thẻ 2x2 inch", status: "pending", required: true },
          { id: "p3", label: "CMND/CCCD", status: "in-progress", required: true }
        ]
      },
      {
        id: "academic",
        title: "Giấy tờ học tập",
        items: [
          { id: "a1", label: "Bằng tốt nghiệp đại học", status: "pending", required: true },
          { id: "a2", label: "Bảng điểm", status: "completed", required: true, completedDate: "20/4" },
          { id: "a3", label: "Thư giới thiệu", status: "pending", required: false }
        ]
      },
      {
        id: "financial",
        title: "Giấy tờ tài chính",
        items: [
          { id: "f1", label: "Sao kê ngân hàng 6 tháng", status: "pending", required: true },
          { id: "f2", label: "Chứng minh thu nhập", status: "in-progress", required: true },
          { id: "f3", label: "Tài sản đảm bảo (nếu có)", status: "pending", required: false }
        ]
      }
    ]
  },
  "2": {
    id: "2",
    title: "Du học bằng cử nhân Canada",
    deadline: "2025-08-15",
    summary: { completed: 1, total: 7 },
    categories: [
      {
        id: "personal",
        title: "Giấy tờ tuỳ thân",
        items: [
          { id: "p1", label: "Hộ chiếu", status: "completed", required: true, completedDate: "06/5" },
          { id: "p2", label: "Ảnh thẻ 35x45mm", status: "pending", required: true }
        ]
      },
      {
        id: "academic",
        title: "Giấy tờ học tập",
        items: [
          { id: "a1", label: "Học bạ THPT", status: "pending", required: true },
          { id: "a2", label: "IELTS/TOEFL", status: "pending", required: false }
        ]
      },
      {
        id: "financial",
        title: "Giấy tờ tài chính",
        items: [
          { id: "f1", label: "Chứng minh tài chính GIC", status: "pending", required: true },
          { id: "f2", label: "Sao kê ngân hàng", status: "pending", required: true },
          { id: "f3", label: "Thư bảo lãnh (nếu có)", status: "pending", required: false }
        ]
      }
    ]
  }
};



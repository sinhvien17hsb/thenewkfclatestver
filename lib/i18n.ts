export type Lang = "vi" | "en";

export const T = {
  // Navbar
  nav_home:     { vi: "Trang chủ", en: "Home" },
  nav_menu:     { vi: "Thực đơn",  en: "Menu" },
  nav_orders:   { vi: "Đơn hàng", en: "My Orders" },
  nav_feedback: { vi: "Đánh giá", en: "Feedback" },
  nav_staff:    { vi: "Nhân viên", en: "Staff" },

  // Categories
  cat_all:        { vi: "Tất cả",      en: "All" },
  cat_combo:      { vi: "Combo",       en: "Combo" },
  cat_ga_ran:     { vi: "Gà Rán",      en: "Chicken" },
  cat_burger:     { vi: "Burger",      en: "Burger" },
  cat_mon_phu:    { vi: "Món Phụ",     en: "Sides" },
  cat_trang_miem: { vi: "Tráng Miệng", en: "Desserts" },
  cat_do_uong:    { vi: "Đồ Uống",     en: "Drinks" },
  cat_com:        { vi: "Cơm",         en: "Rice" },

  // Customer menu
  menu_title:           { vi: "Thực đơn KFC",                   en: "KFC Menu" },
  menu_subtitle:        { vi: "Chọn món yêu thích của bạn",     en: "Choose your favorites" },
  menu_search:          { vi: "Tìm kiếm món ăn...",             en: "Search for food..." },
  menu_popular:         { vi: "Phổ biến nhất",                  en: "Most Popular" },
  menu_add:             { vi: "Thêm",                           en: "Add" },
  menu_view_cart:       { vi: "Xem giỏ hàng",                   en: "View cart" },
  menu_no_results:      { vi: "Không tìm thấy món ăn phù hợp", en: "No items found" },
  menu_found:           { vi: "Tìm thấy",                       en: "Found" },
  menu_results_for:     { vi: "kết quả cho",                    en: "results for" },
  menu_prep_min:        { vi: "phút",                           en: "min" },
  menu_items_unit:      { vi: "món",                            en: "items" },

  // Cart
  cart_title:           { vi: "Giỏ hàng",                                          en: "Cart" },
  cart_types:           { vi: "loại món",                                           en: "item types" },
  cart_empty:           { vi: "Giỏ hàng trống",                                    en: "Cart is empty" },
  cart_empty_desc:      { vi: "Hãy thêm món ăn từ thực đơn nhé!",                  en: "Add items from the menu!" },
  cart_view_menu:       { vi: "Xem thực đơn",                                       en: "View Menu" },
  cart_table_info:      { vi: "Thông tin bàn",                                      en: "Table Info" },
  cart_table_num:       { vi: "Số bàn *",                                           en: "Table number *" },
  cart_table_ph:        { vi: "Nhập số bàn (vd: 5)",                               en: "Enter table number (e.g. 5)" },
  cart_name_label:      { vi: "Tên khách hàng (tùy chọn)",                         en: "Customer name (optional)" },
  cart_name_ph:         { vi: "Nhập tên của bạn",                                  en: "Enter your name" },
  cart_qr:              { vi: "Hoặc quét mã QR tại bàn để nhận diện tự động",      en: "Or scan QR code at your table" },
  cart_summary:         { vi: "Tổng đơn hàng",                                     en: "Order Summary" },
  cart_subtotal:        { vi: "Tạm tính",                                           en: "Subtotal" },
  cart_fee:             { vi: "Phí dịch vụ",                                        en: "Service fee" },
  cart_free:            { vi: "Miễn phí",                                           en: "Free" },
  cart_total:           { vi: "Tổng cộng",                                          en: "Total" },
  cart_place_order:     { vi: "Đặt hàng",                                           en: "Place Order" },
  cart_processing:      { vi: "Đang xử lý...",                                     en: "Processing..." },
  cart_note:            { vi: "Nhấn Đặt hàng để gửi đơn vào bếp",                 en: "Press Place Order to send to kitchen" },
  cart_prep_min:        { vi: "phút chuẩn bị",                                     en: "min prep" },

  // Orders
  orders_title:         { vi: "Theo dõi đơn hàng",                                 en: "Order Tracking" },
  orders_count:         { vi: "đơn hàng",                                           en: "orders" },
  orders_empty:         { vi: "Chưa có đơn hàng nào",                              en: "No orders yet" },
  orders_empty_desc:    { vi: "Đặt món ngay để bắt đầu theo dõi!",                 en: "Order now to start tracking!" },
  orders_order_now:     { vi: "Đặt món ngay",                                       en: "Order Now" },
  orders_progress:      { vi: "Tiến độ",                                            en: "Progress" },
  orders_items:         { vi: "Các món đã đặt:",                                   en: "Items ordered:" },
  orders_table:         { vi: "Bàn",                                                en: "Table" },
  orders_takeaway:      { vi: "Mang về",                                            en: "Takeaway" },
  orders_more:          { vi: "món khác",                                           en: "more items" },
  orders_review:        { vi: "⭐ Đánh giá đơn hàng này",                          en: "⭐ Review this order" },
  orders_ready_banner:  { vi: "🔔 Đơn hàng của bạn đã sẵn sàng! Vui lòng lấy món.", en: "🔔 Your order is ready! Please pick it up." },

  // Status labels
  status_queued:        { vi: "Chờ xử lý",    en: "Queued" },
  status_preparing:     { vi: "Đang làm",      en: "Preparing" },
  status_quality_check: { vi: "Kiểm tra CL",  en: "Quality Check" },
  status_ready:         { vi: "Sẵn sàng",      en: "Ready" },
  status_completed:     { vi: "Hoàn thành",    en: "Completed" },

  // Settings
  settings_title:       { vi: "Cài đặt",                        en: "Settings" },
  settings_subtitle:    { vi: "Tùy chỉnh ứng dụng",            en: "Customize the app" },
  settings_customer:    { vi: "Khách hàng",                     en: "Customer" },
  settings_cust_mode:   { vi: "Chế độ khách hàng",             en: "Customer mode" },
  settings_work_mode:   { vi: "Chế độ làm việc",               en: "Work Mode" },
  settings_general:     { vi: "Chung",                          en: "General" },
  settings_language:    { vi: "Ngôn ngữ",                       en: "Language" },
  settings_about:       { vi: "Về ứng dụng",                    en: "About" },
  settings_version:     { vi: "Phiên bản 1.0.0",               en: "Version 1.0.0" },
  settings_copyright:   { vi: "© 2025 KFC Vietnam · Nhóm 17", en: "© 2025 KFC Vietnam · Group 17" },
  settings_dashboard:   { vi: "Dashboard nhân viên",            en: "Staff Dashboard" },
  settings_dashboard_d: { vi: "Vào trang làm việc của",        en: "Go to work page for" },
  settings_profile:     { vi: "Hồ sơ cá nhân",                  en: "My Profile" },
  settings_profile_d:   { vi: "Xem và chỉnh sửa thông tin tài khoản", en: "View and edit account info" },
  settings_logout:      { vi: "Đăng xuất khỏi hệ thống",       en: "Sign out" },
  settings_logout_d:    { vi: "Chuyển về chế độ khách hàng",   en: "Switch back to customer mode" },
  settings_go_staff:    { vi: "Chuyển sang chế độ nhân viên",  en: "Switch to staff mode" },
  settings_go_staff_d:  { vi: "Dành cho nhân viên KFC có tài khoản", en: "For KFC staff with an account" },
  settings_register:    { vi: "Đăng ký tài khoản nhân viên",   en: "Register staff account" },
  settings_register_d:  { vi: "Tạo tài khoản mới với mã cửa hàng", en: "Create account with store code" },
  settings_using_as:    { vi: "Bạn đang sử dụng ứng dụng với tư cách khách hàng.", en: "You are using the app as a customer." },
} as const;

export type TKey = keyof typeof T;

export function translate(key: TKey, lang: Lang): string {
  return T[key][lang];
}

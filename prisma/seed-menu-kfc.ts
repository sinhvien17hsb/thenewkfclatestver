import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const url = process.env.DATABASE_URL ?? "file:./dev.db";
const adapter = new PrismaBetterSqlite3({ url });
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const prisma = new PrismaClient({ adapter } as any);

const CDN = "https://static.kfcvietnam.com.vn/images/items/lg";
const v = "?v=4lp884";
const img = (file: string) => `${CDN}/${file}${v}`;

const menuItems = [
  // ─── ƯU ĐÃI ───
  { name: "Combo 99K – 4 Miếng Gà",          description: "4 Miếng Gà Rán",                                                                                    category: "uu_dai",     price: 99000,  imageEmoji: "🎁", imageUrl: img("PAYDAY-JUNE.jpg"),      popular: true,  prepTime: 10 },
  { name: "Combo Tiêu Tung Chill",             description: "1 Miếng Gà Rán + 1 Miếng Gà Lắc Tiêu Chanh + 1 ly Pepsi Không Đường (Đại)",                       category: "uu_dai",     price: 85000,  imageEmoji: "🎁", imageUrl: img("TIEUTUNGCHILL.jpg"),    popular: true,  prepTime: 10 },
  { name: "Combo Chanh Sang Chảnh",            description: "2 Miếng Gà Lắc Tiêu Chanh + 1 Miếng Gà Rán + 1 Khoai Tây (Vừa) + 2 ly Pepsi Không Đường (Vừa)", category: "uu_dai",     price: 140000, imageEmoji: "🎁", imageUrl: img("CHANHSANGCHANH.jpg"),   popular: false, prepTime: 12 },
  { name: "Combo Gà Rôm Rả 245k",             description: "3 Miếng Gà Lắc Tiêu Chanh + 3 Miếng Gà Rán + 3 ly Pepsi Không Đường (Vừa)",                       category: "uu_dai",     price: 245000, imageEmoji: "🎁", imageUrl: img("GAKHUAYDAO.jpg"),       popular: true,  prepTime: 15 },
  { name: "Combo Cùng Xơi",                    description: "4 Miếng Gà Rán + 4 Bánh Trứng",                                                                     category: "uu_dai",     price: 189000, imageEmoji: "🎁", imageUrl: img("189-Jun.jpg"),           popular: false, prepTime: 12 },
  { name: "Combo Cùng Quẩy",                   description: "4 Miếng Gà Rán + 5 Miếng Gà Tenders",                                                               category: "uu_dai",     price: 189000, imageEmoji: "🎁", imageUrl: img("Tender-189.jpg"),        popular: false, prepTime: 12 },
  { name: "Combo Cùng Vui",                    description: "6 Miếng Gà Rán tặng kèm 3 lon Pepsi",                                                               category: "uu_dai",     price: 199000, imageEmoji: "🎁", imageUrl: img("6-COB-Jun.jpg"),         popular: true,  prepTime: 14 },
  { name: "Combo Cùng Tiệc",                   description: "9 Miếng Gà Rán + 3 ly Pepsi (Tiêu chuẩn)",                                                          category: "uu_dai",     price: 259000, imageEmoji: "🎁", imageUrl: img("9-COB-Jun.jpg"),         popular: true,  prepTime: 18 },
  { name: "Combo Siêu Nuggets",                description: "20 Miếng Nuggets",                                                                                   category: "uu_dai",     price: 99000,  imageEmoji: "🎁", imageUrl: img("20-Nuggets.jpg"),        popular: true,  prepTime: 8  },
  { name: "Combo Gà & Nuggets",               description: "3 Miếng Gà + 4 Miếng Nuggets",                                                                      category: "uu_dai",     price: 99000,  imageEmoji: "🎁", imageUrl: img("Combo-Nug-99k.jpg"),     popular: false, prepTime: 10 },

  // ─── MÓN MỚI ───
  { name: "1 Miếng Gà Lắc Tiêu Chanh",        description: "Gà rán giòn lắc vị tiêu chanh đặc trưng",                                                           category: "mon_moi",    price: 40000,  imageEmoji: "🍗", imageUrl: img("1TIEUCHANH.jpg"),        popular: true,  prepTime: 7  },
  { name: "2 Miếng Gà Lắc Tiêu Chanh",        description: "2 miếng gà lắc vị tiêu chanh",                                                                       category: "mon_moi",    price: 79000,  imageEmoji: "🍗", imageUrl: img("2TIEUCHANH.jpg"),        popular: false, prepTime: 8  },
  { name: "3 Miếng Gà Lắc Tiêu Chanh",        description: "3 miếng gà lắc vị tiêu chanh",                                                                       category: "mon_moi",    price: 116000, imageEmoji: "🍗", imageUrl: img("3TIEUCHANH.jpg"),        popular: false, prepTime: 10 },
  { name: "Cơm Gà Lắc Tiêu Chanh",            description: "Cơm kèm gà lắc tiêu chanh",                                                                          category: "mon_moi",    price: 52000,  imageEmoji: "🍚", imageUrl: img("COMGA-TIEUCHANH.jpg"),   popular: true,  prepTime: 8  },
  { name: "Khoai Lắc Phô Mai (L)",            description: "Khoai tây chiên giòn tan, lắc đều cùng phô mai thơm ngậy",                                           category: "mon_moi",    price: 32000,  imageEmoji: "🍟", imageUrl: img("KHOAI-PHO-MAI-ALC.jpg"), popular: true,  prepTime: 5  },
  { name: "Khoai Lắc Bơ Tỏi (L)",            description: "Khoai tây chiên giòn tan, lắc đều cùng bơ tỏi thơm lừng",                                            category: "mon_moi",    price: 32000,  imageEmoji: "🍟", imageUrl: img("KHOAI-BO-TOI-ALC.jpg"),  popular: false, prepTime: 5  },
  { name: "Gà Popcorn Lắc Phô Mai (R)",       description: "Gà Popcorn giòn rụm, lắc đều cùng phô mai thơm ngậy",                                               category: "mon_moi",    price: 42000,  imageEmoji: "🍿", imageUrl: img("GA-LAC-PHO-MAI-ALC.jpg"),popular: false, prepTime: 6  },
  { name: "Gà Popcorn Lắc Bơ Tỏi (R)",       description: "Gà Popcorn giòn rụm, lắc đều cùng bơ tỏi thơm lừng",                                                category: "mon_moi",    price: 42000,  imageEmoji: "🍿", imageUrl: img("GA-LAC-BO-TOI-ALC.jpg"), popular: false, prepTime: 6  },
  { name: "1 Miếng Gà Xốt Mắm Tỏi",          description: "Gà rán giòn tan, quyện xốt mắm tỏi đậm đà, cay cay, ngọt ngọt",                                    category: "mon_moi",    price: 40000,  imageEmoji: "🍗", imageUrl: img("1GXMT.jpg"),              popular: true,  prepTime: 7  },
  { name: "2 Miếng Gà Xốt Mắm Tỏi",          description: "Gà rán giòn tan, quyện xốt mắm tỏi đậm đà, cay cay, ngọt ngọt",                                    category: "mon_moi",    price: 79000,  imageEmoji: "🍗", imageUrl: img("2GXMT.jpg"),              popular: false, prepTime: 8  },
  { name: "3 Miếng Gà Xốt Mắm Tỏi",          description: "Gà rán giòn tan, quyện xốt mắm tỏi đậm đà, cay cay, ngọt ngọt",                                    category: "mon_moi",    price: 116000, imageEmoji: "🍗", imageUrl: img("3GXMT.jpg"),              popular: false, prepTime: 10 },
  { name: "Cơm Gà Xốt Mắm Tỏi",              description: "Gà rán giòn tan xốt mắm tỏi đậm đà ăn kèm cơm nóng dẻo",                                           category: "mon_moi",    price: 52000,  imageEmoji: "🍚", imageUrl: img("COM-GXMT.jpg"),           popular: false, prepTime: 8  },

  // ─── COMBO 1 NGƯỜI ───
  { name: "Combo 1 Miếng Gà",                  description: "1 Miếng gà + 1 Khoai tây chiên (Vừa) + 1 Ly Pepsi",                                                 category: "combo_1",    price: 59000,  imageEmoji: "🎁", imageUrl: img("D-CHICKEN-1.jpg"),       popular: true,  prepTime: 8  },
  { name: "Combo Một Mình Chill",               description: "1 Miếng gà + 1 Mì ý xúc xích + 1 Khoai tây (Vừa) + 1 Ly Pepsi",                                   category: "combo_1",    price: 91000,  imageEmoji: "🎁", imageUrl: img("EC.CBO-1COB-Pasta.jpg"), popular: false, prepTime: 10 },
  { name: "Combo 2 Miếng Gà",                  description: "2 Miếng gà + 1 Khoai tây chiên (vừa) + 1 Ly Pepsi",                                                 category: "combo_1",    price: 91000,  imageEmoji: "🎁", imageUrl: img("D-CHICKEN-2.jpg"),       popular: true,  prepTime: 10 },
  { name: "Combo Mỳ Ý Solo",                   description: "1 Mì ý gà rán + 1 Ly Pepsi",                                                                         category: "combo_1",    price: 71000,  imageEmoji: "🎁", imageUrl: img("EC.CBO-1-Pasta-COB.jpg"),popular: false, prepTime: 8  },
  { name: "Combo Mì Ý & Gà Tenders",          description: "1 Mì ý xúc xích + 3 Tender + 1 Ly Pepsi",                                                            category: "combo_1",    price: 79000,  imageEmoji: "🎁", imageUrl: img("EC.CBO-Pasta-Tender.jpg"),popular: false, prepTime: 10 },
  { name: "Combo Cơm Gà Rán Solo",             description: "1 Cơm Gà rán + 1 Ly Pepsi",                                                                          category: "combo_1",    price: 56000,  imageEmoji: "🎁", imageUrl: img("EC.CBO-RICE-COB.jpg"),   popular: true,  prepTime: 8  },
  { name: "Combo Cơm Gà Rán & Súp",           description: "1 Cơm Gà rán + 1 Súp rong biển + 1 Ly Pepsi",                                                        category: "combo_1",    price: 69000,  imageEmoji: "🎁", imageUrl: img("EC.CBO-Rice-Soup.jpg"),  popular: false, prepTime: 8  },
  { name: "Combo Cơm Gà Quay Solo",            description: "1 Cơm Gà quay + 1 Ly Pepsi",                                                                         category: "combo_1",    price: 59000,  imageEmoji: "🎁", imageUrl: img("EC.CBO-RICE-FLAVA.jpg"), popular: false, prepTime: 8  },
  { name: "Combo Cơm Gà Nanban Solo",          description: "1 Cơm Gà nanban + 1 Ly Pepsi",                                                                       category: "combo_1",    price: 46000,  imageEmoji: "🎁", imageUrl: img("EC.CBO-RICE-NANBAN.jpg"),popular: false, prepTime: 8  },
  { name: "Combo Burger Zinger",               description: "1 Burger zinger + 1 Khoai tây chiên (vừa) + 1 Ly Pepsi",                                            category: "combo_1",    price: 79000,  imageEmoji: "🎁", imageUrl: img("D-B.ZINGER-FF.jpg"),     popular: true,  prepTime: 8  },
  { name: "Combo Burger Tôm",                  description: "1 Burger tôm + 1 Khoai tây chiên (vừa) + 1 Ly Pepsi",                                               category: "combo_1",    price: 69000,  imageEmoji: "🎁", imageUrl: img("EC.CBO-B.Shrimp.jpg"),   popular: false, prepTime: 8  },
  { name: "Combo Burger Gà Quay",              description: "1 Burger gà quay + 1 Khoai tây chiên (vừa) + 1 Ly Pepsi",                                           category: "combo_1",    price: 79000,  imageEmoji: "🎁", imageUrl: img("DB-ROASTED-FF.jpg"),     popular: false, prepTime: 8  },

  // ─── COMBO 2 NGƯỜI ───
  { name: "Combo Nhóm 2 No Nê",               description: "4 Miếng gà + 1 Khoai tây chiên (vừa) + 2 Ly Pepsi",                                                  category: "combo_2",    price: 169000, imageEmoji: "👫", imageUrl: img("D.BUCKET4_FF.jpg"),      popular: true,  prepTime: 12 },
  { name: "Combo Nhóm 2 Vui Vẻ",             description: "3 Miếng gà rán + 1 Mì ý gà viên + 1 Khoai tây (vừa) + 2 Ly Pepsi",                                   category: "combo_2",    price: 159000, imageEmoji: "👫", imageUrl: img("EC.Bucket-3-COB.jpg"),   popular: false, prepTime: 12 },
  { name: "Combo Hai Mình Chill",             description: "2 Mì ý xúc xích + 2 Miếng gà rán + 1 Khoai tây (vừa) + 2 Ly Pepsi",                                 category: "combo_2",    price: 146000, imageEmoji: "👫", imageUrl: img("EC.CBO-2-Pasta-COB.jpg"),popular: false, prepTime: 12 },
  { name: "Combo Burger Gà Yo & Gà Rán",     description: "1 Burger gà yo + 2 Miếng gà rán + 1 Khoai tây (vừa) + 2 Ly Pepsi (vừa)",                            category: "combo_2",    price: 129000, imageEmoji: "👫", imageUrl: img("EC.CBO-B.GaYo-COB_.jpg"),popular: false, prepTime: 12 },

  // ─── COMBO NHÓM ───
  { name: "Combo Nhóm 3 Tụ Tập",              description: "5 Miếng gà + 1 Gà viên (Vừa) + 3 Ly Pepsi",                                                          category: "combo_nhom", price: 239000, imageEmoji: "👥", imageUrl: img("EC.Bucket-5-COB.jpg"),   popular: false, prepTime: 15 },
  { name: "Combo Gà Chill 199k",              description: "3 Miếng gà rán + 2 Mì ý xúc xích + 1 Khoai tây (vừa) + 3 Ly Pepsi",                                 category: "combo_nhom", price: 199000, imageEmoji: "👥", imageUrl: img("EC.CBO-3COB-199K.jpg"),  popular: true,  prepTime: 15 },
  { name: "Combo Gà No 279k",                 description: "4 Miếng gà rán + 2 Burger zinger + 1 Khoai tây (vừa) + 4 Ly Pepsi",                                  category: "combo_nhom", price: 279000, imageEmoji: "👥", imageUrl: img("EC.CBO-4COB-279K.jpg"),  popular: false, prepTime: 18 },

  // ─── GÀ RÁN – GÀ QUAY ───
  { name: "1 Miếng Gà Rán",                   description: "1 Miếng Gà Rán + 1 Gói tương (cà/ớt)",                                                               category: "ga_ran",     price: 37000,  imageEmoji: "🍗", imageUrl: img("1-Fried-Chicken.jpg"),   popular: true,  prepTime: 6  },
  { name: "2 Miếng Gà Rán",                   description: "2 Miếng Gà Rán + 2 Gói tương (cà/ớt)",                                                               category: "ga_ran",     price: 74000,  imageEmoji: "🍗", imageUrl: img("2-Fried-Chicken.jpg"),   popular: true,  prepTime: 7  },
  { name: "3 Miếng Gà Rán",                   description: "3 Miếng Gà Rán + 3 Gói tương (cà/ớt)",                                                               category: "ga_ran",     price: 105000, imageEmoji: "🍗", imageUrl: img("3-Fried-Chicken.jpg"),   popular: false, prepTime: 8  },
  { name: "6 Miếng Gà Rán",                   description: "6 Miếng Gà Rán + 6 Gói tương (cà/ớt)",                                                               category: "ga_ran",     price: 210000, imageEmoji: "🍗", imageUrl: img("6-Fried-Chicken-new.jpg"),popular: false, prepTime: 12 },
  { name: "1 Miếng Phi-lê Gà Quay",           description: "1 Miếng Phi-lê Gà Quay",                                                                              category: "ga_ran",     price: 43000,  imageEmoji: "🍗", imageUrl: img("MOD-PHI-LE-GA-QUAY.jpg"),popular: false, prepTime: 7  },
  { name: "3 Miếng Gà Rán Tender",            description: "3 Miếng Gà Rán Tender + 1 Gói tương (cà/ớt)",                                                        category: "ga_ran",     price: 42000,  imageEmoji: "🍗", imageUrl: img("TENDERS-3.jpg"),          popular: true,  prepTime: 6  },
  { name: "5 Miếng Gà Rán Tender",            description: "5 Miếng Gà Rán Tender + 2 Gói tương (cà/ớt)",                                                        category: "ga_ran",     price: 68000,  imageEmoji: "🍗", imageUrl: img("TENDERS-5.jpg"),          popular: false, prepTime: 8  },

  // ─── BURGER – CƠM – MÌ Ý ───
  { name: "Burger Gà Yo",                     description: "1 Burger Gà Yo (cay) / 1 Burger Gà Yo (không cay)",                                                   category: "burger_com", price: 30000,  imageEmoji: "🍔", imageUrl: img("BURGER-GAYO.jpg"),       popular: true,  prepTime: 5  },
  { name: "Burger Phi-lê Gà Quay",            description: "1 Burger Phi-lê Gà Quay + 1 Gói tương (cà/ớt)",                                                      category: "burger_com", price: 56000,  imageEmoji: "🍔", imageUrl: img("Burger-Flava.jpg"),      popular: false, prepTime: 6  },
  { name: "Burger Tôm",                        description: "1 Burger Tôm + 1 Gói tương (cà/ớt)",                                                                  category: "burger_com", price: 45000,  imageEmoji: "🍔", imageUrl: img("Burger-Shrimp.jpg"),     popular: false, prepTime: 5  },
  { name: "Burger Gà Zinger",                 description: "1 Burger Gà Zinger + 1 Gói tương (cà/ớt)",                                                            category: "burger_com", price: 56000,  imageEmoji: "🍔", imageUrl: img("Burger-Zinger.jpg"),     popular: true,  prepTime: 6  },
  { name: "Mì Ý Xúc Xích Gà",               description: "1 Mì Ý Xúc Xích Gà",                                                                                   category: "burger_com", price: 38000,  imageEmoji: "🍝", imageUrl: img("Sausage-Pasta.jpg"),     popular: false, prepTime: 6  },
  { name: "Mì Ý Gà Viên",                    description: "1 Mì Ý Gà Viên",                                                                                       category: "burger_com", price: 43000,  imageEmoji: "🍝", imageUrl: img("Sausage-Pasta-Popcorn.jpg"),popular: false, prepTime: 6 },
  { name: "Mì Ý Gà Rán",                     description: "1 Mì Ý Gà Rán + 1 Gói tương (cà/ớt)",                                                                 category: "burger_com", price: 68000,  imageEmoji: "🍝", imageUrl: img("Sausage-Pasta-COB.jpg"), popular: false, prepTime: 7  },
  { name: "Cơm Gà Rán",                       description: "1 Cơm Gà Rán + 1 Gói tương (cà/ớt)",                                                                  category: "burger_com", price: 49000,  imageEmoji: "🍚", imageUrl: img("Rice-OR.jpg"),            popular: true,  prepTime: 7  },
  { name: "Cơm Gà Viên Nanban",               description: "1 Cơm Gà Viên Nanban + 1 Gói tương (cà/ớt)",                                                          category: "burger_com", price: 40000,  imageEmoji: "🍚", imageUrl: img("NANBAN.jpg"),             popular: false, prepTime: 7  },
  { name: "Cơm Phi-lê Gà Quay",               description: "1 Cơm Phi-lê Gà Quay + 1 Gói tương (cà/ớt)",                                                          category: "burger_com", price: 54000,  imageEmoji: "🍚", imageUrl: img("Rice-Flava.jpg"),         popular: false, prepTime: 7  },
  { name: "Cơm Trắng",                         description: "Cơm trắng",                                                                                            category: "burger_com", price: 12000,  imageEmoji: "🍚", imageUrl: img("Rice.jpg"),               popular: false, prepTime: 2  },

  // ─── THỨC ĂN NHẸ ───
  { name: "Gà Viên Popcorn (Lớn)",            description: "Gà Viên Popcorn (Lớn) + 2 Gói tương (cà/ớt)",                                                         category: "mon_phu",    price: 67000,  imageEmoji: "🍿", imageUrl: img("POP-L.jpg"),              popular: true,  prepTime: 6  },
  { name: "Gà Viên Popcorn (Vừa)",            description: "Gà Viên Popcorn (Vừa) + 1 Gói tương (cà/ớt)",                                                         category: "mon_phu",    price: 40000,  imageEmoji: "🍿", imageUrl: img("POP-R.jpg"),              popular: false, prepTime: 5  },
  { name: "4 Phô Mai Viên",                    description: "4 Phô Mai Viên chiên giòn tan chảy",                                                                   category: "mon_phu",    price: 38000,  imageEmoji: "🧀", imageUrl: img("4-Chewy-Cheese.jpg"),     popular: false, prepTime: 5  },
  { name: "6 Phô Mai Viên",                    description: "6 Phô Mai Viên chiên giòn tan chảy",                                                                   category: "mon_phu",    price: 53000,  imageEmoji: "🧀", imageUrl: img("6-Chewy-Cheese.jpg"),     popular: false, prepTime: 5  },
  { name: "Salad Xốt Mè Rang",                description: "1 Salad Xốt Mè Rang tươi ngon",                                                                        category: "mon_phu",    price: 22000,  imageEmoji: "🥗", imageUrl: img("SALAD-XOT-ME-RANG.jpg"), popular: false, prepTime: 3  },
  { name: "Salad Hạt Gà Viên",                description: "1 Salad Hạt Gà Viên",                                                                                  category: "mon_phu",    price: 37000,  imageEmoji: "🥗", imageUrl: img("SALAD-HAT-GA-VIEN.jpg"), popular: false, prepTime: 3  },
  { name: "Bắp Cải Trộn (Đại)",              description: "1 Bắp Cải Trộn cỡ đại",                                                                                category: "mon_phu",    price: 32000,  imageEmoji: "🥗", imageUrl: img("CL-(J)-new.jpg"),         popular: false, prepTime: 2  },
  { name: "Bắp Cải Trộn (Lớn)",              description: "1 Bắp Cải Trộn cỡ lớn",                                                                                category: "mon_phu",    price: 23000,  imageEmoji: "🥗", imageUrl: img("CL-(L)-new.jpg"),         popular: false, prepTime: 2  },
  { name: "Bắp Cải Trộn (Vừa)",              description: "1 Bắp Cải Trộn cỡ vừa",                                                                                category: "mon_phu",    price: 13000,  imageEmoji: "🥗", imageUrl: img("CL-(R)-new.jpg"),         popular: false, prepTime: 2  },
  { name: "Khoai Tây Chiên (Đại)",           description: "Khoai Tây Chiên (Đại) + 2 Gói tương (cà/ớt)",                                                          category: "mon_phu",    price: 40000,  imageEmoji: "🍟", imageUrl: img("FF-J.jpg"),               popular: false, prepTime: 5  },
  { name: "Khoai Tây Chiên (Lớn)",           description: "Khoai Tây Chiên (Lớn) + 1 Gói tương (cà/ớt)",                                                          category: "mon_phu",    price: 30000,  imageEmoji: "🍟", imageUrl: img("FF-L.jpg"),               popular: true,  prepTime: 4  },
  { name: "Khoai Tây Chiên (Vừa)",           description: "Khoai Tây Chiên (Vừa) + 1 Gói tương (cà/ớt)",                                                          category: "mon_phu",    price: 20000,  imageEmoji: "🍟", imageUrl: img("FF-R.jpg"),               popular: true,  prepTime: 4  },
  { name: "Khoai Tây Nghiền (Đại)",          description: "Khoai Tây Nghiền cỡ đại",                                                                               category: "mon_phu",    price: 32000,  imageEmoji: "🥔", imageUrl: img("MP-(J)-new.jpg"),         popular: false, prepTime: 3  },
  { name: "Khoai Tây Nghiền (Lớn)",          description: "Khoai Tây Nghiền cỡ lớn",                                                                               category: "mon_phu",    price: 23000,  imageEmoji: "🥔", imageUrl: img("MP-(L)-new.jpg"),         popular: false, prepTime: 3  },
  { name: "Khoai Tây Nghiền (Vừa)",          description: "Khoai Tây Nghiền cỡ vừa",                                                                               category: "mon_phu",    price: 13000,  imageEmoji: "🥔", imageUrl: img("MP-(R)-new.jpg"),         popular: false, prepTime: 3  },
  { name: "Súp Rong Biển",                    description: "Súp Rong Biển thơm ngon",                                                                               category: "mon_phu",    price: 20000,  imageEmoji: "🍲", imageUrl: img("Soup-Rong-Bien.jpg"),     popular: false, prepTime: 3  },

  // ─── ĐỒ UỐNG & TRÁNG MIỆNG ───
  { name: "1 Bánh Trứng",                     description: "1 Bánh Trứng thơm ngon",                                                                               category: "do_uong",    price: 20000,  imageEmoji: "🥚", imageUrl: img("EGGTART-1.jpg"),         popular: true,  prepTime: 2  },
  { name: "4 Bánh Trứng",                     description: "4 Bánh Trứng thơm ngon",                                                                               category: "do_uong",    price: 72000,  imageEmoji: "🥚", imageUrl: img("EGGTART-4.jpg"),         popular: false, prepTime: 2  },
  { name: "Pepsi (Tiêu Chuẩn)",              description: "1 Ly Pepsi (Tiêu Chuẩn)",                                                                               category: "do_uong",    price: 13000,  imageEmoji: "🥤", imageUrl: img("PEPSI-STD.jpg"),         popular: false, prepTime: 1  },
  { name: "Pepsi (Vừa)",                      description: "1 Ly Pepsi (Vừa)",                                                                                      category: "do_uong",    price: 17000,  imageEmoji: "🥤", imageUrl: img("PEPSI-M.jpg"),            popular: true,  prepTime: 1  },
  { name: "Pepsi (Đại)",                      description: "1 Ly Pepsi (Lớn)",                                                                                      category: "do_uong",    price: 20000,  imageEmoji: "🥤", imageUrl: img("PEPSI-J.jpg"),            popular: false, prepTime: 1  },
  { name: "Pepsi Không Đường (Tiêu Chuẩn)", description: "1 Ly Pepsi Không Đường (Tiêu Chuẩn)",                                                                   category: "do_uong",    price: 13000,  imageEmoji: "🥤", imageUrl: img("PEPSI-ZERO-STD.jpg"),    popular: false, prepTime: 1  },
  { name: "Pepsi Không Đường (Vừa)",         description: "1 Ly Pepsi Không Đường (Vừa)",                                                                          category: "do_uong",    price: 17000,  imageEmoji: "🥤", imageUrl: img("PEPSI-ZERO-M.jpg"),      popular: false, prepTime: 1  },
  { name: "Pepsi Không Đường (Đại)",         description: "1 Ly Pepsi Không Đường (Lớn)",                                                                          category: "do_uong",    price: 20000,  imageEmoji: "🥤", imageUrl: img("PEPSI-ZERO-J.jpg"),      popular: false, prepTime: 1  },
  { name: "Pepsi (Lon)",                      description: "1 Pepsi (Lon)",                                                                                          category: "do_uong",    price: 20000,  imageEmoji: "🥤", imageUrl: img("PEPSI_CAN.jpg"),          popular: false, prepTime: 1  },
  { name: "7Up (Tiêu Chuẩn)",               description: "1 Ly 7Up (Tiêu Chuẩn)",                                                                                 category: "do_uong",    price: 13000,  imageEmoji: "🥤", imageUrl: img("7UP-STD.jpg"),            popular: false, prepTime: 1  },
  { name: "7Up (Vừa)",                        description: "1 Ly 7Up (Vừa)",                                                                                        category: "do_uong",    price: 17000,  imageEmoji: "🥤", imageUrl: img("7UP-R.jpg"),              popular: false, prepTime: 1  },
  { name: "7Up (Đại)",                        description: "1 Ly 7Up (Lớn)",                                                                                        category: "do_uong",    price: 20000,  imageEmoji: "🥤", imageUrl: img("7UP-L.jpg"),              popular: false, prepTime: 1  },
  { name: "7Up (Lon)",                        description: "1 7Up (Lon)",                                                                                            category: "do_uong",    price: 20000,  imageEmoji: "🥤", imageUrl: img("7UP_CAN.jpg"),            popular: false, prepTime: 1  },
  { name: "Lipton (Tiêu Chuẩn)",            description: "1 Ly Lipton (Tiêu Chuẩn)",                                                                               category: "do_uong",    price: 13000,  imageEmoji: "🍵", imageUrl: img("LIPTON-STD.jpg"),         popular: false, prepTime: 1  },
  { name: "Lipton (Vừa)",                    description: "1 Ly Lipton (Vừa)",                                                                                      category: "do_uong",    price: 17000,  imageEmoji: "🍵", imageUrl: img("LIPTON-M.jpg"),           popular: false, prepTime: 1  },
  { name: "Lipton (Đại)",                    description: "1 Ly Lipton (Lớn)",                                                                                      category: "do_uong",    price: 20000,  imageEmoji: "🍵", imageUrl: img("LIPTON-J.jpg"),           popular: false, prepTime: 1  },
  { name: "Pepsi Không Đường (Lon)",         description: "1 Pepsi Không Đường (Lon)",                                                                              category: "do_uong",    price: 20000,  imageEmoji: "🥤", imageUrl: img("Pepsi-Zero-Can-ALC.jpg"), popular: false, prepTime: 1  },
];

async function main() {
  // Hide old items that aren't part of the new menu
  const newNames = new Set(menuItems.map((i) => i.name));
  const existing = await prisma.menuItem.findMany({ select: { id: true, name: true } });
  const toHide = existing.filter((e: { id: string; name: string }) => !newNames.has(e.name));
  if (toHide.length > 0) {
    await prisma.menuItem.updateMany({
      where: { id: { in: toHide.map((e: { id: string }) => e.id) } },
      data: { available: false },
    });
    console.log(`✓ Hid ${toHide.length} old menu items`);
  }

  // Upsert all new items
  const existingNames = new Map(existing.map((e: { id: string; name: string }) => [e.name, e.id]));
  let created = 0;
  let updated = 0;
  for (const item of menuItems) {
    const existingId = existingNames.get(item.name);
    if (existingId) {
      await prisma.menuItem.update({
        where: { id: existingId },
        data: { ...item, available: true },
      });
      updated++;
    } else {
      await prisma.menuItem.create({ data: { ...item, available: true } });
      created++;
    }
  }
  console.log(`✓ Created ${created} new items, updated ${updated} existing items`);
  console.log(`✓ Total menu: ${menuItems.length} items`);

  // ─── SEED DEMO ORDERS ───
  // Wipe & re-seed every build so timestamps stay fresh (0–25 min ago)
  await prisma.orderStatusHistory.deleteMany({ where: { order: { orderNumber: { startsWith: "DEMO" } } } });
  await prisma.orderItem.deleteMany({ where: { order: { orderNumber: { startsWith: "DEMO" } } } });
  await prisma.order.deleteMany({ where: { orderNumber: { startsWith: "DEMO" } } });

  const allItems = await prisma.menuItem.findMany({ select: { id: true, name: true, price: true } });
  const byName = (name: string) => allItems.find((m: { id: string; name: string; price: number }) => m.name === name)!;
  const minsAgo = (m: number) => new Date(Date.now() - m * 60 * 1000);

  const demoOrders: Array<{
    orderNumber: string; tableNumber: string; customerName: string;
    status: string; minutesAgo: number; estimatedTime: number;
    items: Array<{ name: string; qty: number }>;
  }> = [
    {
      orderNumber: "DEMO0101", tableNumber: "3", customerName: "Nguyễn Văn An",
      status: "queued", minutesAgo: 2, estimatedTime: 15,
      items: [{ name: "Combo 99K – 4 Miếng Gà", qty: 1 }, { name: "Pepsi (Vừa)", qty: 2 }],
    },
    {
      orderNumber: "DEMO0102", tableNumber: "7", customerName: "Trần Thị Bình",
      status: "queued", minutesAgo: 5, estimatedTime: 12,
      items: [{ name: "Combo Tiêu Tung Chill", qty: 1 }, { name: "Khoai Tây Chiên (Vừa)", qty: 1 }],
    },
    {
      orderNumber: "DEMO0103", tableNumber: "12", customerName: "Lê Minh Châu",
      status: "queued", minutesAgo: 7, estimatedTime: 18,
      items: [{ name: "Combo Cùng Xơi", qty: 1 }, { name: "7Up (Vừa)", qty: 2 }, { name: "1 Bánh Trứng", qty: 2 }],
    },
    {
      orderNumber: "DEMO0201", tableNumber: "2", customerName: "Phạm Thị Dung",
      status: "preparing", minutesAgo: 10, estimatedTime: 15,
      items: [{ name: "Combo Siêu Nuggets", qty: 1 }, { name: "Khoai Tây Chiên (Đại)", qty: 1 }, { name: "Pepsi Không Đường (Vừa)", qty: 1 }],
    },
    {
      orderNumber: "DEMO0202", tableNumber: "9", customerName: "Hoàng Văn Em",
      status: "preparing", minutesAgo: 14, estimatedTime: 20,
      items: [{ name: "Combo Gà Rôm Rả 245k", qty: 1 }, { name: "Lipton (Vừa)", qty: 3 }],
    },
    {
      orderNumber: "DEMO0203", tableNumber: "1", customerName: "Vũ Thị Phương",
      status: "preparing", minutesAgo: 16, estimatedTime: 18,
      items: [{ name: "Combo Chanh Sang Chảnh", qty: 1 }, { name: "Súp Rong Biển", qty: 2 }],
    },
    {
      orderNumber: "DEMO0301", tableNumber: "6", customerName: "Đặng Văn Giang",
      status: "quality_check", minutesAgo: 20, estimatedTime: 15,
      items: [{ name: "Combo Cùng Vui", qty: 1 }, { name: "Khoai Tây Nghiền (Lớn)", qty: 2 }, { name: "Pepsi (Đại)", qty: 2 }],
    },
    {
      orderNumber: "DEMO0302", tableNumber: "4", customerName: "Bùi Thị Hoa",
      status: "quality_check", minutesAgo: 22, estimatedTime: 20,
      items: [{ name: "Combo Cùng Tiệc", qty: 1 }, { name: "4 Bánh Trứng", qty: 1 }],
    },
    {
      orderNumber: "DEMO0401", tableNumber: "11", customerName: "Ngô Văn Inh",
      status: "ready", minutesAgo: 23, estimatedTime: 15,
      items: [{ name: "Combo Gà & Nuggets", qty: 2 }, { name: "7Up (Đại)", qty: 2 }],
    },
    {
      orderNumber: "DEMO0402", tableNumber: "8", customerName: "Đinh Thị Kim",
      status: "ready", minutesAgo: 25, estimatedTime: 18,
      items: [{ name: "Combo Cùng Quẩy", qty: 1 }, { name: "Pepsi Không Đường (Đại)", qty: 2 }, { name: "1 Bánh Trứng", qty: 3 }],
    },
  ];

  for (const o of demoOrders) {
    const orderItems = o.items.map((i) => {
      const mi = byName(i.name);
      return { menuItemId: mi.id, quantity: i.qty, price: mi.price, notes: null };
    });
    const total = orderItems.reduce((s, i) => s + i.price * i.quantity, 0);
    await prisma.order.create({
      data: {
        orderNumber: o.orderNumber,
        tableNumber: o.tableNumber,
        customerName: o.customerName,
        status: o.status,
        totalAmount: total,
        estimatedTime: o.estimatedTime,
        createdAt: minsAgo(o.minutesAgo),
        items: { create: orderItems },
        statusHistory: { create: [{ status: o.status }] },
      },
    });
  }
  console.log(`✓ Seeded ${demoOrders.length} demo orders (statuses: queued×3, preparing×3, quality_check×2, ready×2)`);
}

main().catch(console.error).finally(() => prisma.$disconnect());

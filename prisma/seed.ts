import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import bcrypt from "bcryptjs";

const url = process.env.DATABASE_URL ?? "file:./dev.db";
const adapter = new PrismaBetterSqlite3({ url });
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const prisma = new PrismaClient({ adapter } as any);

const BASE = "?w=400&h=280&fit=crop&auto=format";
const I = {
  combo1:  `https://images.unsplash.com/photo-1550317138-10000687a72b${BASE}`,
  combo2:  `https://images.unsplash.com/photo-1562967914-608f82629710${BASE}`,
  combo3:  `https://images.unsplash.com/photo-1598182198343-47c6d35ece3b${BASE}`,
  bucket:  `https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58${BASE}`,
  ch_orig: `https://images.unsplash.com/photo-1562967914-608f82629710${BASE}`,
  ch_spicy:`https://images.unsplash.com/photo-1527477396000-e27163b481c2${BASE}`,
  strips:  `https://images.unsplash.com/photo-1598182198343-47c6d35ece3b${BASE}`,
  popcorn: `https://images.unsplash.com/photo-1562967914-608f82629710${BASE}`,
  zinger:  `https://images.unsplash.com/photo-1568901346375-23c9450c58cd${BASE}`,
  tower:   `https://images.unsplash.com/photo-1568901346375-23c9450c58cd${BASE}`,
  twister: `https://images.unsplash.com/photo-1565299507177-b0ac66763828${BASE}`,
  sandwich:`https://images.unsplash.com/photo-1565299507177-b0ac66763828${BASE}`,
  fries:   `https://images.unsplash.com/photo-1573080496219-bb080dd4f877${BASE}`,
  mashed:  `https://images.unsplash.com/photo-1574894709920-11b28e7367e3${BASE}`,
  coleslaw:`https://images.unsplash.com/photo-1512621776951-a57141f2eefd${BASE}`,
  corn:    `https://images.unsplash.com/photo-1551754655-cd27e38d2076${BASE}`,
  mozza:   `https://images.unsplash.com/photo-1541592106381-b31e9677c0e5${BASE}`,
  sundae:  `https://images.unsplash.com/photo-1563805042-7684c019e1cb${BASE}`,
  sundae2: `https://images.unsplash.com/photo-1497034825429-c343d7c6a68f${BASE}`,
  cake:    `https://images.unsplash.com/photo-1558961363-fa8fdf82db35${BASE}`,
  cookie:  `https://images.unsplash.com/photo-1499636136210-6f4ee915583e${BASE}`,
  pepsi:   `https://images.unsplash.com/photo-1629203851122-3726ecdf080e${BASE}`,
  mtdew:   `https://images.unsplash.com/photo-1527960471264-932f39eb5846${BASE}`,
  tea:     `https://images.unsplash.com/photo-1556679343-c7306c1976bc${BASE}`,
  orange:  `https://images.unsplash.com/photo-1621506289937-a8e4df240d0b${BASE}`,
  soup:    `https://images.unsplash.com/photo-1547592166-23ac45744acd${BASE}`,
};

const menuItems = [
  // ─── COMBO ───
  { name: "Zinger Combo L",          description: "Zinger Burger + Khoai Tây L + Pepsi L. Tiết kiệm 20k so với mua lẻ.",               category: "combo",     price: 99000,  imageEmoji: "🎁", imageUrl: I.combo1,  popular: true,  prepTime: 12 },
  { name: "Gà Rán Combo L",          description: "Gà Rán Nguyên Bản + Khoai L + Pepsi L. Combo phổ biến nhất của KFC.",               category: "combo",     price: 89000,  imageEmoji: "🎁", imageUrl: I.combo2,  popular: true,  prepTime: 12 },
  { name: "Crispy Combo",            description: "3 Crispy Strips + Khoai M + Pepsi M. Nhẹ nhàng, đủ no cho một người.",               category: "combo",     price: 95000,  imageEmoji: "🎁", imageUrl: I.combo3,  popular: false, prepTime: 10 },
  { name: "Family Feast 8 Miếng",    description: "8 Gà Rán + 4 Pepsi M + 3 Khoai M + 3 Coleslaw. Lý tưởng cho cả gia đình.",         category: "combo",     price: 289000, imageEmoji: "👨‍👩‍👧‍👦", imageUrl: I.bucket,  popular: true,  prepTime: 15 },
  { name: "Mega Bucket 12 Miếng",    description: "12 miếng gà rán đủ loại + 6 Pepsi + 4 Khoai L. Combo VIP cho nhóm lớn.",            category: "combo",     price: 399000, imageEmoji: "🎁", imageUrl: I.bucket,  popular: true,  prepTime: 18 },
  { name: "Twister Combo M",         description: "Twister Cuộn Gà + Khoai M + Pepsi M. Nhẹ nhàng và đầy đủ dinh dưỡng.",              category: "combo",     price: 79000,  imageEmoji: "🎁", imageUrl: I.twister, popular: false, prepTime: 10 },
  // ─── GÀ RÁN ───
  { name: "Gà Rán Nguyên Bản",       description: "Công thức gốc 11 gia vị bí truyền từ Đại tá Sanders. Lớp da giòn, thịt mềm thơm.", category: "ga_ran",    price: 42000,  imageEmoji: "🍗", imageUrl: I.ch_orig,  popular: true,  prepTime: 8 },
  { name: "Gà Cay Đặc Biệt",         description: "Vị cay đậm đà nồng nàn, lớp da giòn tan khó cưỡng. Dành cho người thích cay.",     category: "ga_ran",    price: 45000,  imageEmoji: "🌶️", imageUrl: I.ch_spicy, popular: true,  prepTime: 8 },
  { name: "Gà Rán Nguyên Bản ×2",    description: "2 miếng gà rán nguyên bản đậm vị, giòn từ trong ra ngoài.",                         category: "ga_ran",    price: 79000,  imageEmoji: "🍗", imageUrl: I.ch_orig,  popular: false, prepTime: 10 },
  { name: "Gà Cay ×2",               description: "2 miếng gà cay đặc biệt, thơm nồng — ăn một lần là ghiền.",                         category: "ga_ran",    price: 85000,  imageEmoji: "🌶️", imageUrl: I.ch_spicy, popular: false, prepTime: 10 },
  { name: "Crispy Strips ×3",         description: "3 miếng gà phi lê không xương, giòn tan, dễ ăn, chấm sốt đặc biệt.",               category: "ga_ran",    price: 75000,  imageEmoji: "🍗", imageUrl: I.strips,   popular: true,  prepTime: 8 },
  { name: "Crispy Strips ×5",         description: "5 miếng gà phi lê không xương cực ngon, phù hợp chia sẻ hoặc no đủ.",              category: "ga_ran",    price: 119000, imageEmoji: "🍗", imageUrl: I.strips,   popular: false, prepTime: 10 },
  { name: "Popcorn Chicken L",        description: "Những viên gà bỏng ngô giòn vàng ươm cỡ lớn, snack hoàn hảo mọi lúc.",            category: "ga_ran",    price: 55000,  imageEmoji: "🍿", imageUrl: I.popcorn,  popular: true,  prepTime: 6 },
  { name: "Popcorn Chicken M",        description: "Những viên gà bỏng ngô giòn cỡ vừa, nhẹ nhàng và tiện lợi.",                      category: "ga_ran",    price: 42000,  imageEmoji: "🍿", imageUrl: I.popcorn,  popular: false, prepTime: 6 },
  // ─── BURGER ───
  { name: "Zinger Burger",           description: "Phi lê gà Zinger giòn + sốt đặc biệt + bánh mè thơm. Burger bán chạy số 1 KFC.",   category: "burger",    price: 65000,  imageEmoji: "🍔", imageUrl: I.zinger,   popular: true,  prepTime: 6 },
  { name: "Double Down Zinger",      description: "Hai miếng phi lê gà thay bánh, phô mai, sốt mayo. Món burger độc đáo nhất KFC.",    category: "burger",    price: 89000,  imageEmoji: "🍔", imageUrl: I.zinger,   popular: true,  prepTime: 7 },
  { name: "Zinger Tower Burger",     description: "Zinger cao tầng với Hash Brown giòn béo, phô mai và sốt đặc trưng.",                category: "burger",    price: 79000,  imageEmoji: "🍔", imageUrl: I.tower,    popular: false, prepTime: 7 },
  { name: "Twister Cuộn Gà",         description: "Gà giòn cuộn rau tươi, sốt trứng muối đặc biệt. Nhẹ nhàng và đầy hương vị.",       category: "burger",    price: 55000,  imageEmoji: "🌯", imageUrl: I.twister,  popular: true,  prepTime: 5 },
  { name: "Chicken Sandwich",        description: "Sandwich gà mềm mại, rau tươi và sốt đặc trưng KFC. Bữa sáng hoặc bữa nhẹ lý tưởng.", category: "burger", price: 59000,  imageEmoji: "🍔", imageUrl: I.sandwich, popular: false, prepTime: 5 },
  // ─── MÓN PHỤ ───
  { name: "Khoai Tây Chiên L",       description: "Khoai tây chiên vàng giòn tan cỡ lớn, rắc muối biển đặc trưng KFC.",               category: "mon_phu",   price: 35000,  imageEmoji: "🍟", imageUrl: I.fries,    popular: false, prepTime: 4 },
  { name: "Khoai Tây Chiên M",       description: "Khoai tây chiên vàng giòn cỡ vừa, phù hợp cho một người ăn kèm.",                  category: "mon_phu",   price: 28000,  imageEmoji: "🍟", imageUrl: I.fries,    popular: true,  prepTime: 4 },
  { name: "Khoai Nghiền Phô Mai",    description: "Khoai tây nghiền mịn, sốt phô mai béo ngậy, thơm ngon từng muỗng.",                category: "mon_phu",   price: 25000,  imageEmoji: "🥔", imageUrl: I.mashed,   popular: true,  prepTime: 3 },
  { name: "Coleslaw L",              description: "Salad bắp cải tươi ngon, sốt mayonnaise KFC đặc trưng, cỡ lớn.",                   category: "mon_phu",   price: 25000,  imageEmoji: "🥗", imageUrl: I.coleslaw, popular: false, prepTime: 2 },
  { name: "Coleslaw M",              description: "Salad bắp cải cỡ vừa, ăn kèm gà rán rất hợp.",                                    category: "mon_phu",   price: 18000,  imageEmoji: "🥗", imageUrl: I.coleslaw, popular: false, prepTime: 2 },
  { name: "Bắp Ngọt Nướng",          description: "Bắp ngọt nướng bơ thơm, vị ngọt tự nhiên, giòn và mọng nước.",                    category: "mon_phu",   price: 22000,  imageEmoji: "🌽", imageUrl: I.corn,     popular: false, prepTime: 5 },
  { name: "Mozzarella Sticks ×3",    description: "3 thanh phô mai mozzarella chiên giòn tan chảy, kéo sợi cực đã.",                  category: "mon_phu",   price: 35000,  imageEmoji: "🧀", imageUrl: I.mozza,    popular: false, prepTime: 5 },
  // ─── TRÁNG MIỆNG ───
  { name: "Sundae Caramel",          description: "Kem mềm mịn phủ sốt caramel vàng thơm ngọt, mát lạnh sảng khoái.",                 category: "trang_miem",price: 22000,  imageEmoji: "🍦", imageUrl: I.sundae,   popular: false, prepTime: 2 },
  { name: "Sundae Chocolate",        description: "Kem mềm mịn phủ sốt chocolate đậm đà, yêu thích của mọi lứa tuổi.",                category: "trang_miem",price: 22000,  imageEmoji: "🍫", imageUrl: I.sundae2,  popular: true,  prepTime: 2 },
  { name: "Bánh Cupcake",            description: "Bánh cupcake xốp mềm nhân kem tươi hấp dẫn, thơm ngọt từng miếng.",                category: "trang_miem",price: 29000,  imageEmoji: "🧁", imageUrl: I.cake,     popular: false, prepTime: 2 },
  { name: "Cookie Mật Ong",          description: "Bánh quy mật ong giòn xốp, thơm nhẹ nhàng, kết thúc bữa ăn hoàn hảo.",            category: "trang_miem",price: 15000,  imageEmoji: "🍪", imageUrl: I.cookie,   popular: false, prepTime: 1 },
  // ─── ĐỒ UỐNG ───
  { name: "Pepsi L",                 description: "Pepsi lạnh sảng khoái cỡ lớn 500ml. Bổ sung năng lượng tức thì.",                  category: "do_uong",   price: 25000,  imageEmoji: "🥤", imageUrl: I.pepsi,    popular: false, prepTime: 1 },
  { name: "Pepsi M",                 description: "Pepsi lạnh cỡ vừa 350ml, phù hợp ăn kèm với combo bất kỳ.",                       category: "do_uong",   price: 20000,  imageEmoji: "🥤", imageUrl: I.pepsi,    popular: true,  prepTime: 1 },
  { name: "Mountain Dew L",          description: "Mountain Dew mát lạnh cỡ lớn, hương chanh the mát đặc trưng.",                    category: "do_uong",   price: 25000,  imageEmoji: "🥤", imageUrl: I.mtdew,    popular: false, prepTime: 1 },
  { name: "Trà Đào L",               description: "Trà đào thơm mát hương vị tươi ngon 500ml — đồ uống mới được yêu thích nhất.",    category: "do_uong",   price: 30000,  imageEmoji: "🍑", imageUrl: I.tea,      popular: true,  prepTime: 2 },
  { name: "Nước Cam Ép L",           description: "Nước cam ép tươi nguyên chất cỡ lớn, giàu vitamin C, không thêm đường.",          category: "do_uong",   price: 35000,  imageEmoji: "🍊", imageUrl: I.orange,   popular: false, prepTime: 2 },
  { name: "Súp Gà Nóng",             description: "Súp gà thơm nóng hổi, ấm lòng ngày mưa — đặc biệt hot vào mùa lạnh.",            category: "do_uong",   price: 30000,  imageEmoji: "🍲", imageUrl: I.soup,     popular: false, prepTime: 3 },
];

const demoAccounts = [
  { name: "Quản lý Demo", employeeId: "manager01", branch: "KFC Nhóm 17", role: "MANAGER" },
  { name: "Nhân viên Bếp", employeeId: "kitchen01", branch: "KFC Nhóm 17", role: "KITCHEN" },
  { name: "Thu Ngân", employeeId: "cashier01", branch: "KFC Nhóm 17", role: "CASHIER" },
];

async function main() {
  console.log("Seeding database...");

  await prisma.menuItem.deleteMany();
  for (const item of menuItems) {
    await prisma.menuItem.create({ data: { ...item, available: true } });
  }
  console.log(`✓ Created ${menuItems.length} menu items`);

  const pw = await bcrypt.hash("123456", 10);
  for (const acc of demoAccounts) {
    const exists = await prisma.employee.findUnique({ where: { employeeId: acc.employeeId } });
    if (!exists) {
      await prisma.employee.create({ data: { ...acc, password: pw } });
      console.log(`✓ Created account: ${acc.employeeId} (password: 123456)`);
    } else {
      console.log(`  Skipped existing account: ${acc.employeeId}`);
    }
  }

  console.log("\nDemo accounts (all use password: 123456):");
  console.log("  manager01 → Manager dashboard");
  console.log("  kitchen01 → Kitchen board");
  console.log("  cashier01 → Staff panel");
  console.log("\nStore code for registration: KFCNHOM17");
}

main().catch(console.error).finally(() => prisma.$disconnect());

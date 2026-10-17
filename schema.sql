CREATE TABLE IF NOT EXISTS settings (k TEXT PRIMARY KEY, v TEXT);
CREATE TABLE IF NOT EXISTS people (id TEXT PRIMARY KEY, name TEXT NOT NULL, pos TEXT, role TEXT NOT NULL, phone TEXT, sig TEXT);
CREATE TABLE IF NOT EXISTS leaves (id TEXT PRIMARY KEY, pid TEXT NOT NULL, type TEXT NOT NULL, start_date TEXT NOT NULL, end_date TEXT NOT NULL, days REAL NOT NULL, reason TEXT, phone TEXT, written TEXT, use_sig INTEGER DEFAULT 1);
CREATE INDEX IF NOT EXISTS idx_leaves_start ON leaves(start_date);
INSERT OR IGNORE INTO settings VALUES ('school','โรงเรียนบ้านไร่'),('fname','ใบลา_{ชื่อ}_{ประเภท}_{วันที่}');
INSERT OR IGNORE INTO people VALUES
 ('p1','นางพิมพ์พิไล โปธิ','ครูชำนาญการ','teacher','0987506565',''),
 ('p2','นางสาวศิรินภา หล้าลัว','ธุรการโรงเรียน','hr','',''),
 ('p3','นางเพชรรัตน์ หาญจวนิช','ครูชำนาญการพิเศษ','head','',''),
 ('p4','นายชโยทิต น้ำดอกไม้','ผู้อำนวยการโรงเรียนบ้านไร่','director','','');

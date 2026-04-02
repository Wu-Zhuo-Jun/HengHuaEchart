import { Language } from "@/language/LocaleContext";

// 年龄枚举
export const ageEnums = {
  1: { title: Language.YINGER, key: 1 },
  2: { title: Language.ERTONG, key: 2 },
  4: { title: Language.QINGNIAN, key: 4 },
  5: { title: Language.ZHUANGNIAN, key: 5 },
  6: { title: Language.ZHONGLAONIAN, key: 6 },
  7: { title: Language.WEIZHI, key: 7 },
};

// 性别枚举
export const genderEnums = {
  1: { title: Language.NAN, key: 1 },
  2: { title: Language.NV, key: 2 },
  // 3: { title: Language.WEIZHI, key: 3 },
};

// 表情枚举
export const faceEnums = {
  1: { title: Language.FENNU, key: 1 },
  2: { title: Language.KUNHUO, key: 2 },
  3: { title: Language.GAOXIN, key: 3 },
  4: { title: Language.PINGJING, key: 4 },
  5: { title: Language.JINGYA, key: 5 },
  6: { title: Language.HAIPA, key: 6 },
  7: { title: Language.YANWU, key: 7 },
  8: { title: Language.BEISHANG, key: 8 },
  9: { title: Language.WEIZHI, key: 9 },
};

// 年龄Option
export const ageEnumsOptions = [
  { label: "全部", value: "ALL" },
  { label: Language.YINGER, value: 1 },
  { label: Language.ERTONG, value: 2 },
  { label: Language.QINGNIAN, value: 4 },
  { label: Language.ZHUANGNIAN, value: 5 },
  { label: Language.ZHONGLAONIAN, value: 6 },
  { label: Language.WEIZHI, value: 7 },
];

// 性别Option
export const genderEnumsOptions = [
  { label: "全部", value: "ALL" },
  { label: Language.NAN, value: 1 },
  { label: Language.NV, value: 2 },
];

// 客群属性榜指标（男性、女性、婴儿、儿童、青年、壮年、中老年、未知）
export const faceRankingIndicators = [
  { key: "boyCount", label: Language.NANXING, gender: 1, age: 2 },
  { key: "girlCount", label: Language.NVXING, gender: 2, age: 2 },
  { key: "infantCount", label: Language.YINGER, age: 1 },
  { key: "childCount", label: Language.ERTONG, age: 2 },
  { key: "youthCount", label: Language.QINGNIAN, age: 4 },
  { key: "primeCount", label: Language.ZHUANGNIAN, age: 5 },
  { key: "elderlyCount", label: Language.ZHONGLAONIAN, age: 6 },
  { key: "unknownCount", label: Language.WEIZHI, age: 7 },
];

export const FACE_RANKING_DEFAULT_SELECTED = ["boyCount", "girlCount", "infantCount", "childCount", "youthCount", "primeCount", "elderlyCount", "unknownCount"];

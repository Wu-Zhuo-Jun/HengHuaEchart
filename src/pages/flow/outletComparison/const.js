export const outletObj = {
  ALL: {
    label: "总客流",
    value: "ALL",
    key: "ALL",
    children: [{ label: "全选", value: "ALL", key: "ALL", disabled: false }],
  },
  // OUTSIDE: {
  //   label: "场外客流",
  //   value: "OUTSIDE",
  //   key: "OUTSIDE",
  //   children: [],
  // },
  FLOOR: {
    label: "楼层",
    value: "FLOOR",
    key: "FLOOR",
    children: [{ label: "全选", value: "ALL", key: "ALL", disabled: false }],
  },
  // UNKNOWN: {
  //   label: "未知",
  //   value: "UNKNOWN",
  //   key: "UNKNOWN",
  //   children: [],
  // },
};

// 出入口树形结构
export const outletTree = [
  {
    title: "总客流",
    value: "ALL",
    key: "ALL",
    disabled: true,
    selected: false,
    children: [],
  },
  // {
  //   title: "场外客流",
  //   value: "OUTSIDE",
  //   key: "OUTSIDE",
  //   disabled: true,
  //   selected: false,
  //   children: [],
  // },
  {
    title: "楼层",
    value: "FLOOR",
    key: "FLOOR",
    disabled: true,
    selected: false,
    children: [],
  },
];

export const outletTypeList = [
  {
    label: "总客流",
    value: "ALL",
    key: "ALL",
  },
  // {
  //   label: "场外客流",
  //   value: "OUTSIDE",
  //   key: "OUTSIDE",
  // },

  {
    label: "楼层",
    value: "FLOOR",
    key: "FLOOR",
  },

  // {
  //   label: "未知",
  //   value: "UNKNOWN",
  //   key: "UNKNOWN",
  // },
];

export const ageEnum = {
  1: "婴儿",
  2: "儿童",
  3: "青年",
  4: "壮年",
  5: "中老年",
  6: "未知",
};

export const ageEnum2 = {
  1: "(0-6岁)",
  2: "(7-12岁)",
  3: "(18-29岁)",
  4: "(30-50岁)",
  5: "(51岁以上)",
  6: "(未知)",
};

export const genderEnum = {
  1: "男",
  2: "女",
  3: "未知",
};

export const faceEnum = {
  1: "愤怒",
  2: "悲伤",
  3: "厌恶",
  4: "害怕",
  5: "惊讶",
  6: "平静",
  7: "高兴",
  8: "困惑",
  9: "未知",
};

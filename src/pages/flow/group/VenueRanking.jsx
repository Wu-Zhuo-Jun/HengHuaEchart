import "./VenueRanking.less";
import { Tabs, Select, Button, Table, Space, TreeSelect, message } from "antd";
import { DownOutlined, UpOutlined } from "@ant-design/icons";
import { TimeGranulePicker } from "@/components/common/timeGranulePicker";
import User from "@/data/UserData";
import Constant from "@/common/Constant";
import React, { useState, useCallback, useEffect, useMemo } from "react";
import IndicatorConfigModal, { DEFAULT_SELECTED, ALL_INDICATORS } from "./IndicatorConfigModal";
import FaceIndicatorConfigModal, { FACE_RANKING_DEFAULT_SELECTED, faceRankingIndicators } from "./FaceIndicatorConfigModal";
import { ageEnumsOptions, genderEnumsOptions, ageEnums, genderEnums } from "../floorAnalyse/const";
import dayjs from "dayjs";
import { Language } from "@/language/LocaleContext";
import Http from "@/config/Http";
import ArrayUtils from "@/utils/ArrayUtils";
import StringUtils from "@/utils/StringUtils";
import ExportUtils from "@/utils/ExportUtils";
import FirstPoint from "@/assets/images/FirstPoint (1).png";
import SecondPoint from "@/assets/images/FirstPoint (2).png";
import ThirdPoint from "@/assets/images/FirstPoint (3).png";
import { ICPComponent, UIContentLoading } from "@/components/ui/UIComponent";

// 各指标列配置
const INDICATOR_COLUMN_MAP = {
  inCount: {
    dataIndex: "inCount",
    key: "inCount",
    title: Language.JINCHANGRENCI,
    sorter: (a, b) => a.inCount - b.inCount,
    render: (val) => val?.toLocaleString(),
  },
  inNum: {
    dataIndex: "inNum",
    key: "inNum",
    title: Language.JINCHANGRENSHU,
    sorter: (a, b) => a.inNum - b.inNum,
    render: (val) => val?.toLocaleString(),
  },
  batchCount: {
    dataIndex: "batchCount",
    key: "batchCount",
    title: Language.KELIUPICI,
    sorter: (a, b) => a.batchCount - b.batchCount,
    render: (val) => val?.toLocaleString(),
  },
  collectCount: {
    dataIndex: "collectCount",
    key: "collectCount",
    title: Language.JIKELIPINGFANG,
    sorter: (a, b) => a.collectCount - b.collectCount,
  },
  outsideCount: {
    dataIndex: "outsideCount",
    key: "outsideCount",
    title: Language.CHANGWAIKELIU,
    sorter: (a, b) => a.outsideCount - b.outsideCount,
    render: (val) => val?.toLocaleString(),
  },
  inRate: {
    dataIndex: "inRate",
    key: "inRate",
    title: Language.JINCHANGLV,
    sorter: (a, b) => parseFloat(a.inRate) - parseFloat(b.inRate),
  },
  outCount: {
    dataIndex: "outCount",
    key: "outCount",
    title: Language.CHUCHANGRENCI,
    sorter: (a, b) => (a.outCount || 0) - (b.outCount || 0),
    render: (val) => val?.toLocaleString(),
  },
  passNum: {
    dataIndex: "passNum",
    key: "passNum",
    title: Language.GUODIANKELIU,
    sorter: (a, b) => (a.passNum || 0) - (b.passNum || 0),

    render: (val) => val?.toLocaleString(),
  },
  inStoreRate: {
    dataIndex: "inStoreRate",
    key: "inStoreRate",
    title: Language.JINDIANLV,
    sorter: (a, b) => parseFloat(a.inStoreRate) - parseFloat(b.inStoreRate),
  },
};

// 客群属性榜指标列配置（男性、女性、婴儿、儿童、青年、壮年、中老年、未知）
const FACE_INDICATOR_COLUMN_MAP = faceRankingIndicators.reduce((acc, item) => {
  acc[item.key] = {
    dataIndex: item.key,
    key: item.key,
    title: item.label,
    sorter: (a, b) => (a[item.key] || 0) - (b[item.key] || 0),
    render: (val) => (val != null ? Number(val).toLocaleString() : "-"),
  };
  return acc;
}, {});

/** 场地排行 */
function VenueRanking() {
  const [tab, setTab] = useState("客流排行榜");
  const [groupOptions, setGroupOptions] = useState(null);

  useEffect(() => {
    Http.getGroupSelection({}, (res) => {
      let options = [];
      if (res.result == 1) {
        let groups = res.data;
        groups = transformToOptions(groups);
        options = ArrayUtils.dataList2TreeNode(groups, "groupId");
        options = ArrayUtils.setTreeParentNames(options, [], "groupName");
        options = [{ label: Language.QUANBU, title: Language.QUANBU, value: "all", key: "all" }, ...options];
      }
      setGroupOptions(options);
    });
  }, []);

  const handleTabChange = (key) => {
    setTab(key);
    try {
      localStorage.setItem(VENUE_RANKING_TAB_STORAGE, key);
    } catch {}
    setTimeout(() => {
      window.dispatchEvent(new Event("resize"));
    }, 50);
  };
  console.log(User.ranking, 124);
  return (
    <div className="venueRanking noScroll">
      <Tabs
        className="venueRankingTabs"
        size="middle"
        activeKey={tab}
        items={[
          { label: "客流排行榜", key: "客流排行榜" },
          { label: "客群属性榜", key: "客群属性榜" },
        ]}
        onChange={handleTabChange}
      />
      <div style={{ display: tab === "客流排行榜" ? "block" : "none" }}>
        <FlowRankingPage groupClearTimeMap={User.groupClearTimeMap} groupOptions={groupOptions} />
      </div>
      <div style={{ display: tab === "客群属性榜" ? "block" : "none" }}>
        <FackRankingPage groupClearTimeMap={User.groupClearTimeMap} groupOptions={groupOptions} />
      </div>
    </div>
  );
}

/** 从树结构中收集所有 value（不含 all） */
const collectAllGroupValues = (tree) => {
  const values = [];
  const walk = (nodes) => {
    if (!Array.isArray(nodes)) return;
    nodes.forEach((node) => {
      if (node.value && node.value !== "all") values.push(node.value);
      if (node.children) walk(node.children);
    });
  };
  walk(tree);
  return values;
};

/** 根据 groupId 在集团树中查找，返回一级集团-二级集团-三级集团 格式的层级路径 */
const getGroupHierarchyPath = (groupId, groupOptions) => {
  if (!groupId || !groupOptions || !Array.isArray(groupOptions)) return "";
  const group = ArrayUtils.findTreeNode(groupOptions, groupId, "groupId", "children");
  if (!group) return "";
  const pathNames = [...(group.parentNames || []), group.groupName].filter(Boolean);
  return pathNames.join("-");
};

/** 集团选项转换（与 SiteManagement 保持一致，使用 getGroupSelection 接口） */
const transformToOptions = (data) => {
  const options = data.map((item) => {
    item.label = item.groupName;
    item.title = item.groupName;
    item.value = item.groupId;
    return item;
  });
  options.push({ label: Language.WEIFENPEIJIEDIAN, title: Language.WEIFENPEIJIEDIAN, value: "0" });
  return options;
};

/** 客流排行榜 */
const FlowRankingPage = React.memo(({ groupClearTimeMap, groupOptions }) => {
  const hasOverStoreFlowPermission = User.checkMasterPermission(Constant.MASTER_POWER.OVER_STORE_COUNT); // 过店客流权限
  const hasOutCountPermission = User.checkMasterPermission(Constant.MASTER_POWER.OUT_COUNT); // 出场次数权限
  const hasOutsideCountPermission = User.checkMasterPermission(Constant.MASTER_POWER.OUTSIDE_COUNT); // 场外客流权限
  const [timeRange, setTimeRange] = useState([dayjs(), dayjs()]);
  const [selectedGroups, setSelectedGroups] = useState([]);
  const [baseTime, setBaseTime] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [sortField, setSortField] = useState("inCount");
  const [sortOrder, setSortOrder] = useState("descend");
  const [indicatorConfig, setIndicatorConfig] = useState(DEFAULT_SELECTED);
  const [configModalOpen, setConfigModalOpen] = useState(false);
  const [flowRankingList, setFlowRankingList] = useState([]);
  const [loading, setLoading] = useState(false);

  const visibleIndicatorConfig = useMemo(() => {
    return indicatorConfig.filter((k) => {
      if (k === "passNum" || k === "inStoreRate") return hasOverStoreFlowPermission;
      if (k === "outsideCount" || k === "inRate") return hasOutsideCountPermission;
      if (k === "outCount") return hasOutCountPermission;
      return true;
    });
  }, [indicatorConfig, hasOverStoreFlowPermission, hasOutsideCountPermission, hasOutCountPermission]);

  useEffect(() => {
    const hiddenByPermission =
      ((sortField === "passNum" || sortField === "inStoreRate") && !hasOverStoreFlowPermission) ||
      ((sortField === "outsideCount" || sortField === "inRate") && !hasOutsideCountPermission) ||
      (sortField === "outCount" && !hasOutCountPermission);
    if (hiddenByPermission) {
      const firstKey = visibleIndicatorConfig[0] || "inCount";
      setSortField(firstKey);
    }
  }, [hasOverStoreFlowPermission, hasOutsideCountPermission, hasOutCountPermission, sortField, visibleIndicatorConfig]);

  // 从 localStorage 恢复默认配置，下次打开按保存的勾选
  useEffect(() => {
    try {
      const saved = localStorage.getItem("flowRankingIndicatorConfig");
      const parsed = saved ? JSON.parse(saved) : null;
      const isKeyVisible = (k) => {
        if (k === "passNum" || k === "inStoreRate") return hasOverStoreFlowPermission;
        if (k === "outsideCount" || k === "inRate") return hasOutsideCountPermission;
        if (k === "outCount") return hasOutCountPermission;
        return true;
      };
      const validKeys = Array.isArray(parsed) ? parsed.filter((k) => ALL_INDICATORS.some((i) => i.key === k) && isKeyVisible(k)) : [];
      if (validKeys.length > 0) {
        setIndicatorConfig(validKeys);
        setSortField(validKeys[0]);
      }
    } catch {
      // 解析失败时使用默认配置
    }
  }, [hasOverStoreFlowPermission, hasOutsideCountPermission, hasOutCountPermission]);

  // 指标配置应用
  const handleIndicatorConfigApply = useCallback((keys, saveAsDefault) => {
    setIndicatorConfig(keys);
    if (keys.length > 0) setSortField(keys[0]);
    if (saveAsDefault) localStorage.setItem("flowRankingIndicatorConfig", JSON.stringify(keys));
  }, []);

  const requestGroupFlowRanking = useCallback(() => {
    const _SelectedGroups = selectedGroups.filter((item) => item !== "all");
    if (!_SelectedGroups.length) {
      message.warning("集团不能为空");
      return;
    }
    if (baseTime == null) {
      message.warning("基准时间不能为空");
      return;
    }
    let Params = {
      groupIds: _SelectedGroups.join(","),
      clearTime: baseTime,
      startDate: timeRange[0].format("YYYY-MM-DD"),
      endDate: timeRange[1].format("YYYY-MM-DD"),
    };
    setLoading(true);
    Http.getGroupFlowRanking(Params, (res) => {
      setLoading(false);
      if (res.result == 1) {
        const arr = (res.data || []).map((item, index) => {
          const groupId = item.groupId;
          const groupInfo = getGroupHierarchyPath(groupId, groupOptions) || "";
          const inCount = item.inCount || 0;
          const inNum = item.inNum || 0;
          const batchCount = item.batchCount || 0;
          const collectCount = StringUtils.toFixed(item.area ? item.inCount / item.area : 0, 2); // 集客力
          const siteOutNum = (item.osInCount || 0) + (item.osOutCount || 0); // 场外客流
          const inRate = siteOutNum === 0 ? "100%" : StringUtils.toFixed((inCount / siteOutNum) * 100, 2) + "%"; // 进场率
          const outCount = item.outCount || 0;
          const passNum = item.passNum || 0;
          const inStoreRate = passNum === 0 ? "100%" : StringUtils.toFixed((inCount / passNum) * 100, 2) + "%"; // 进店率
          return {
            key: item.siteId || index,
            siteName: item.siteName,
            groupInfo,
            inCount,
            inNum,
            batchCount,
            collectCount,
            outsideCount: siteOutNum,
            inRate,
            outCount,
            passNum,
            inStoreRate,
          };
        });
        setFlowRankingList(arr);
      } else {
        setFlowRankingList([]);
      }
    });
  }, [selectedGroups, baseTime, timeRange, groupOptions]);

  const getRankCell = (rank) => {
    if (rank === 1) {
      return (
        <div className="circle-image">
          <img src={FirstPoint} alt="" />
        </div>
      );
    }
    if (rank === 2) {
      return (
        <div className="circle-image">
          <img src={SecondPoint} alt="" />
        </div>
      );
    }
    if (rank === 3) {
      return (
        <div className="circle-image">
          <img src={ThirdPoint} alt="" />
        </div>
      );
    }
    return rank;
  };

  const columns = [
    {
      title: Language.PAIMING,
      key: "rank",
      width: 70,
      align: "center",
      render: (_, __, index) => getRankCell((currentPage - 1) * pageSize + index + 1),
      sorter: false,
    },
    {
      title: Language.CHANGDIMINGMINGCHENG,
      dataIndex: "siteName",
      key: "siteName",
      width: 220,
      ellipsis: true,
      render: (text, record) => (
        <div className="flow-ranking-page__site-cell" title={[text, record.groupInfo].filter(Boolean).join(" / ")}>
          <div className="flow-ranking-page__site-name">{text}</div>
          <div className="flow-ranking-page__site-info">{record.groupInfo}</div>
        </div>
      ),
    },
    ...visibleIndicatorConfig
      .filter((key) => INDICATOR_COLUMN_MAP[key])
      .map((key) => {
        const col = { ...INDICATOR_COLUMN_MAP[key], align: "center" };
        return col;
      }),
  ];

  const baseTimeOptions = useMemo(() => {
    const map = groupClearTimeMap || {};
    const groupIds = selectedGroups.includes("all") ? Object.keys(map) : selectedGroups.filter((id) => id !== "all");
    const clearTimeSet = new Set();
    groupIds.forEach((groupId) => {
      const times = map[groupId];
      if (Array.isArray(times)) times.forEach((t) => clearTimeSet.add(Math.floor(Number(t))));
    });
    return [...clearTimeSet]
      .sort((a, b) => a - b)
      .map((hour) => {
        const str = String(hour).padStart(2, "0") + ":00";
        return { label: str, value: hour };
      });
  }, [selectedGroups, groupClearTimeMap]);

  // 按默认排序展示表格数据，默认降序
  const sortedFlowRankingList = useMemo(() => {
    if (!flowRankingList?.length) return flowRankingList;
    const col = INDICATOR_COLUMN_MAP[sortField];
    if (!col?.sorter) return flowRankingList;
    return [...flowRankingList].sort((a, b) => {
      const result = col.sorter(a, b);
      return sortOrder === "ascend" ? result : -result;
    });
  }, [flowRankingList, sortField, sortOrder]);

  // 集团选项更改时清除所选的基准时间
  useEffect(() => {
    setBaseTime(null);
  }, [selectedGroups]);

  // 统计周期显示：根据 timeRange 及是否含今日
  const getStatsPeriodText = () => {
    if (!timeRange?.[0] || !timeRange?.[1]) return "";
    const today = dayjs().format("YYYY-MM-DD");
    const startDate = timeRange[0].format("YYYY-MM-DD");
    const endDate = timeRange[1].format("YYYY-MM-DD");
    const isSingleDay = startDate === endDate;
    const isTodayInRange = today >= startDate && today <= endDate;
    const cutoffTime = dayjs().format("HH") + ":00"; // 当前可查询到的最后一个小时结数据的小时整点+1

    if (isSingleDay && isTodayInRange) {
      return `${startDate} (今日数据截至${cutoffTime})`;
    }
    if (!isSingleDay && isTodayInRange) {
      return `${startDate} ~ ${endDate} (今日数据截至${cutoffTime})`;
    }
    if (isSingleDay) {
      return startDate;
    }
    return `${startDate} ~ ${endDate}`;
  };

  const statsPeriodText = getStatsPeriodText();

  const handleExport = useCallback(() => {
    if (!flowRankingList?.length) {
      message.warning("暂无数据可导出");
      return;
    }
    const sortedList = [...flowRankingList].sort((a, b) => {
      const col = INDICATOR_COLUMN_MAP[sortField];
      if (!col?.sorter) return 0;
      return col.sorter(a, b) * (sortOrder === "ascend" ? 1 : -1);
    });
    const exportData = sortedList.map((item, index) => ({
      ...item,
      rank: index + 1,
    }));
    const exportColumns = [
      { title: Language.PAIMING, dataIndex: "rank", key: "rank" },
      { title: Language.CHANGDIMINGMINGCHENG, dataIndex: "siteName", key: "siteName" },
      { title: Language.SUOSHUJITUAN, dataIndex: "groupInfo", key: "groupInfo" },
      ...visibleIndicatorConfig
        .filter((key) => INDICATOR_COLUMN_MAP[key])
        .map((key) => ({
          title: INDICATOR_COLUMN_MAP[key].title,
          dataIndex: INDICATOR_COLUMN_MAP[key].dataIndex,
          key: INDICATOR_COLUMN_MAP[key].key,
        })),
    ];
    const isSameDay = timeRange?.[0]?.isSame?.(timeRange?.[1]);
    const timeStr = timeRange?.[0] ? (isSameDay ? timeRange[0].format("YYYYMMDD") : `${timeRange[0].format("YYYYMMDD")}-${timeRange[1]?.format("YYYYMMDD")}`) : "export";
    ExportUtils.exportDynamicMerge([{ columns: exportColumns, dataSource: exportData, title: "场地客流排行榜" }], {
      fileName: `客流排行榜-${timeStr}`,
    });
  }, [flowRankingList, sortField, sortOrder, visibleIndicatorConfig, timeRange]);

  return (
    <div className="flow-ranking-page">
      <div className="flow-ranking-page__search-bar">
        <Space size="middle" wrap className="flow-ranking-page__filters">
          <div className="flow-ranking-page__filter-item">
            <span className="flow-ranking-page__filter-label">时间：</span>
            <TimeGranulePicker onTimeChange={setTimeRange} />
          </div>
          <div className="flow-ranking-page__filter-item">
            <span className="flow-ranking-page__filter-label">集团：</span>
            <TreeSelect
              allowClear
              showSearch
              treeNodeFilterProp="label"
              treeData={groupOptions || []}
              treeCheckable
              treeCheckStrictly
              multiple
              placeholder="请选择集团"
              value={selectedGroups}
              onChange={(v, _, c) => {
                const rawList = Array.isArray(v) ? v : [];
                const newVal = rawList.map((item) => (typeof item === "object" && item?.value != null ? item.value : item));
                const allGroupIds = collectAllGroupValues(groupOptions || []);
                const isAllGroupsSelected = allGroupIds.length > 0 && allGroupIds.every((id) => newVal.includes(id));
                const isAllChecked = c.triggerValue === "all";

                if (selectedGroups.includes("all")) {
                  // 已勾选「全部」
                  if (isAllChecked) {
                    // 取消「全部」时全部取消勾选
                    setSelectedGroups([]);
                  } else if (!isAllGroupsSelected) {
                    // 取消部分集团时，取消「全部」
                    setSelectedGroups(newVal.filter((x) => x !== "all"));
                  }
                } else if (isAllGroupsSelected) {
                  // 手动勾选全部集团时，自动勾选「全部」
                  setSelectedGroups(["all", ...allGroupIds]);
                } else if (isAllChecked) {
                  // 手动勾选「全部」时，自动勾选全部集团
                  setSelectedGroups(["all", ...allGroupIds]);
                } else {
                  setSelectedGroups(newVal);
                }
              }}
              showCheckedStrategy={TreeSelect.SHOW_ALL}
              maxTagCount={1}
              style={{ minWidth: 280 }}
            />
          </div>
          <div className="flow-ranking-page__filter-item">
            <span className="flow-ranking-page__filter-label">基准时间：</span>
            <Select value={baseTime} onChange={setBaseTime} options={baseTimeOptions} style={{ width: 150 }} placeholder="请选择" />
          </div>
          <Button type="primary" onClick={requestGroupFlowRanking}>
            {Language.CHAXUN}
          </Button>
        </Space>
      </div>
      <div className="noScroll" style={{ flex: 1, overflow: "auto" }}>
        <div className="flow-ranking-page__table-wrapper">
          <UIContentLoading loading={loading}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div className="flow-ranking-page__stats-period">统计周期: {statsPeriodText}</div>
              <div className="flow-ranking-page__table-actions">
                <Button className="flow-ranking-page__config-btn" onClick={() => setConfigModalOpen(true)}>
                  指标配置
                </Button>
                <Button type="primary" onClick={handleExport}>
                  导出数据
                </Button>
              </div>
            </div>
            <Table
              className="flow-ranking-page__table"
              columns={columns}
              dataSource={sortedFlowRankingList}
              pagination={{
                total: sortedFlowRankingList.length,
                current: currentPage,
                pageSize,
                showSizeChanger: true,
                showQuickJumper: true,
                pageSizeOptions: ["12", "24", "48"],
                showTotal: (total) => `共${total}条`,
                locale: {
                  items_per_page: `条/页`,
                  jump_to: "跳至",
                  page: "页",
                },
              }}
              onChange={(pagination, filters, sorter) => {
                setCurrentPage(pagination.current);
                setPageSize(pagination.pageSize || 12);
                // 至少保持一项降序，取消排序时恢复默认列
                const field = sorter?.field ?? sorter?.columnKey;
                if (field && sorter?.order) {
                  setSortField(field);
                  setSortOrder(sorter.order);
                } else {
                  const firstKey = visibleIndicatorConfig[0] || "inCount";
                  setSortField(firstKey);
                  setSortOrder("descend");
                }
              }}
            />
            <IndicatorConfigModal open={configModalOpen} onClose={() => setConfigModalOpen(false)} value={indicatorConfig} onApply={handleIndicatorConfigApply} />
          </UIContentLoading>
        </div>
        <ICPComponent style={{ height: "auto", paddingTop: "14px" }} />
      </div>
    </div>
  );
});

/** 属性排行榜（客群属性榜） */
const FackRankingPage = React.memo(({ groupClearTimeMap, groupOptions }) => {
  const [timeRange, setTimeRange] = useState([dayjs(), dayjs()]);
  const [selectedGroups, setSelectedGroups] = useState([]);
  const [baseTime, setBaseTime] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [sortField, setSortField] = useState("boyCount");
  const [sortOrder, setSortOrder] = useState("descend");
  const [indicatorConfig, setIndicatorConfig] = useState(FACE_RANKING_DEFAULT_SELECTED);
  const [configModalOpen, setConfigModalOpen] = useState(false);
  const [flowRankingList, setFlowRankingList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [genderSelect, setGenderSelect] = useState(["ALL"]);
  const [ageSelect, setAgeSelect] = useState(["ALL"]);
  const [expand, setExpand] = useState(false);

  const visibleIndicatorConfig = useMemo(() => indicatorConfig.filter((k) => faceRankingIndicators.some((i) => i.key === k)), [indicatorConfig]);

  // 年龄筛选条件
  const ageEnumsSelect = useMemo(() => {
    if (ageSelect.includes("ALL")) return ageEnums;
    const selected = {};
    ageSelect.forEach((v) => {
      if (ageEnums[v]) selected[v] = ageEnums[v];
    });
    return selected;
  }, [ageSelect]);

  // 性别筛选条件
  const genderEnumsSelect = useMemo(() => {
    if (genderSelect.includes("ALL")) return genderEnums;
    const selected = {};
    genderSelect.forEach((v) => {
      if (genderEnums[v]) selected[v] = genderEnums[v];
    });
    return selected;
  }, [genderSelect]);

  const showFilterColor = useMemo(() => !genderSelect.includes("ALL") || !ageSelect.includes("ALL"), [genderSelect, ageSelect]);

  const setGenderFunction = useCallback((value) => {
    if (value === "ALL") {
      setGenderSelect(["ALL"]);
      localStorage.removeItem("faceRanking_genderSelect");
    } else {
      setGenderSelect((prev) => {
        const next = prev.includes(value) ? prev.filter((x) => x !== value) : [...prev.filter((x) => x !== "ALL"), value];
        const final = next.length ? next : ["ALL"];
        if (final.length && !final.includes("ALL")) localStorage.setItem("faceRanking_genderSelect", final.join(","));
        return final;
      });
    }
  }, []);

  const setAgeFunction = useCallback((value) => {
    if (value === "ALL") {
      setAgeSelect(["ALL"]);
      localStorage.removeItem("faceRanking_ageSelect");
    } else {
      setAgeSelect((prev) => {
        const next = prev.includes(value) ? prev.filter((x) => x !== value) : [...prev.filter((x) => x !== "ALL"), value];
        const final = next.length ? next : ["ALL"];
        if (final.length && !final.includes("ALL")) localStorage.setItem("faceRanking_ageSelect", final.join(","));
        return final;
      });
    }
  }, []);

  useEffect(() => {
    const g = localStorage.getItem("faceRanking_genderSelect");
    if (g) setGenderSelect(g.split(",").map((x) => (x === "ALL" ? "ALL" : Number(x))));
    const a = localStorage.getItem("faceRanking_ageSelect");
    if (a) setAgeSelect(a.split(",").map((x) => (x === "ALL" ? "ALL" : Number(x))));
  }, []);

  // 从 localStorage 恢复客群属性指标配置
  useEffect(() => {
    try {
      const saved = localStorage.getItem("faceRankingIndicatorConfig");
      const parsed = saved ? JSON.parse(saved) : null;
      const validKeys = Array.isArray(parsed) ? parsed.filter((k) => faceRankingIndicators.some((i) => i.key === k)) : [];
      if (validKeys.length > 0) {
        setIndicatorConfig(validKeys);
        setSortField(validKeys[0]);
      }
    } catch {
      // 解析失败时使用默认
    }
  }, []);

  const handleIndicatorConfigApply = useCallback((keys, saveAsDefault) => {
    setIndicatorConfig(keys);
    if (keys.length > 0) setSortField(keys[0]);
    if (saveAsDefault) localStorage.setItem("faceRankingIndicatorConfig", JSON.stringify(keys));
  }, []);

  const requestGroupFlowRanking = useCallback(() => {
    const _SelectedGroups = selectedGroups.filter((item) => item !== "all");
    if (!_SelectedGroups.length) {
      message.warning("集团不能为空");
      return;
    }
    if (baseTime == null) {
      message.warning("基准时间不能为空");
      return;
    }
    // gender: 0=全部 1(男性) 2(女性) 3(未知)，逗号分隔
    // age: 0=全部 1(婴儿) 2(儿童) 4(青年) 5(壮年) 6(老年) 7(未知)，逗号分隔
    const genderParam = genderSelect.includes("ALL") ? "0" : genderSelect.filter((x) => x !== "ALL").join(",");
    const ageParam = ageSelect.includes("ALL") ? "0" : ageSelect.filter((x) => x !== "ALL").join(",");
    const Params = {
      groupIds: _SelectedGroups.join(","),
      clearTime: baseTime,
      startDate: timeRange[0].format("YYYY-MM-DD"),
      endDate: timeRange[1].format("YYYY-MM-DD"),
      gender: genderParam,
      age: ageParam,
    };
    setLoading(true);
    Http.getGroupFaceRanking(Params, (res) => {
      setLoading(false);
      if (res.result == 1) {
        const arr = (res.data || []).map((item, index) => {
          const groupId = item.groupId;
          const groupInfo = getGroupHierarchyPath(groupId, groupOptions) || "";
          // const faceStats = item.faceStats || [];
          // const parseFaceCount = (g, a) => {
          //   if (!Array.isArray(faceStats)) return 0;
          //   return faceStats.reduce((sum, f) => {
          //     if (g != null && f.g !== g) return sum;
          //     if (a != null && f.a !== a) return sum;
          //     return sum + (f.count || f.c || 0);
          //   }, 0);
          // };
          return {
            key: item.siteId || index,
            siteName: item.siteName,
            groupInfo,
            boyCount: item.gender[0],
            girlCount: item.gender[1],
            infantCount: item.age[0],
            childCount: item.age[1],
            youthCount: item.age[2],
            primeCount: item.age[3],
            elderlyCount: item.age[4],
            unknownCount: item.age[5],
          };
        });
        setFlowRankingList(arr);
      } else {
        setFlowRankingList([]);
      }
    });
  }, [selectedGroups, baseTime, timeRange, groupOptions, genderSelect, ageSelect]);

  const getRankCell = (rank) => {
    if (rank === 1) {
      return (
        <div className="circle-image">
          <img src={FirstPoint} alt="" />
        </div>
      );
    }
    if (rank === 2) {
      return (
        <div className="circle-image">
          <img src={SecondPoint} alt="" />
        </div>
      );
    }
    if (rank === 3) {
      return (
        <div className="circle-image">
          <img src={ThirdPoint} alt="" />
        </div>
      );
    }
    return rank;
  };

  const columns = [
    {
      title: Language.PAIMING,
      key: "rank",
      width: 70,
      align: "center",
      render: (_, __, index) => getRankCell((currentPage - 1) * pageSize + index + 1),
      sorter: false,
    },
    {
      title: Language.CHANGDIMINGMINGCHENG,
      dataIndex: "siteName",
      key: "siteName",
      width: 220,
      ellipsis: true,
      render: (text, record) => (
        <div className="flow-ranking-page__site-cell" title={[text, record.groupInfo].filter(Boolean).join(" / ")}>
          <div className="flow-ranking-page__site-name">{text}</div>
          <div className="flow-ranking-page__site-info">{record.groupInfo}</div>
        </div>
      ),
    },
    ...visibleIndicatorConfig
      .filter((key) => FACE_INDICATOR_COLUMN_MAP[key])
      .map((key) => {
        const col = { ...FACE_INDICATOR_COLUMN_MAP[key], align: "center" };
        return col;
      }),
  ];

  const baseTimeOptions = useMemo(() => {
    const map = groupClearTimeMap || {};
    const groupIds = selectedGroups.includes("all") ? Object.keys(map) : selectedGroups.filter((id) => id !== "all");
    const clearTimeSet = new Set();
    groupIds.forEach((groupId) => {
      const times = map[groupId];
      if (Array.isArray(times)) times.forEach((t) => clearTimeSet.add(Math.floor(Number(t))));
    });
    return [...clearTimeSet]
      .sort((a, b) => a - b)
      .map((hour) => {
        const str = String(hour).padStart(2, "0") + ":00";
        return { label: str, value: hour };
      });
  }, [selectedGroups, groupClearTimeMap]);

  // 按默认排序（升序/降序）展示表格数据，默认降序
  const sortedFlowRankingList = useMemo(() => {
    if (!flowRankingList?.length) return flowRankingList;
    const col = FACE_INDICATOR_COLUMN_MAP[sortField];
    if (!col?.sorter) return flowRankingList;
    return [...flowRankingList].sort((a, b) => {
      const result = col.sorter(a, b);
      return sortOrder === "ascend" ? result : -result;
    });
  }, [flowRankingList, sortField, sortOrder]);

  useEffect(() => {
    setBaseTime(null);
  }, [selectedGroups]);

  // 客群属性榜统计周期
  const getStatsPeriodText = () => {
    if (!timeRange?.[0] || !timeRange?.[1]) return "";
    const today = dayjs().format("YYYY-MM-DD");
    const startDate = timeRange[0].format("YYYY-MM-DD");
    const endDate = timeRange[1].format("YYYY-MM-DD");
    const isSingleDay = startDate === endDate;
    const isTodayInRange = today >= startDate && today <= endDate;
    const cutoffTime = dayjs().format("HH") + ":00"; // 当前可查询到的最后一个小时结数据的小时整点+1

    if (isSingleDay && isTodayInRange) {
      return `${startDate} (今日数据截至${cutoffTime})`;
    }
    if (!isSingleDay && isTodayInRange) {
      return `${startDate} ~ ${endDate} (今日数据截至${cutoffTime})`;
    }
    if (isSingleDay) {
      return startDate;
    }
    return `${startDate} ~ ${endDate}`;
  };

  const statsPeriodText = getStatsPeriodText();

  const handleExport = useCallback(() => {
    if (!flowRankingList?.length) {
      message.warning("暂无数据可导出");
      return;
    }
    const sortedList = [...flowRankingList].sort((a, b) => {
      const col = FACE_INDICATOR_COLUMN_MAP[sortField];
      if (!col?.sorter) return 0;
      return col.sorter(a, b) * (sortOrder === "ascend" ? 1 : -1);
    });
    const exportData = sortedList.map((item, index) => ({ ...item, rank: index + 1 }));
    const exportColumns = [
      { title: Language.PAIMING, dataIndex: "rank", key: "rank" },
      { title: Language.CHANGDIMINGMINGCHENG, dataIndex: "siteName", key: "siteName" },
      { title: Language.SUOSHUJITUAN, dataIndex: "groupInfo", key: "groupInfo" },
      ...visibleIndicatorConfig
        .filter((key) => FACE_INDICATOR_COLUMN_MAP[key])
        .map((key) => ({
          title: FACE_INDICATOR_COLUMN_MAP[key].title,
          dataIndex: FACE_INDICATOR_COLUMN_MAP[key].dataIndex,
          key: FACE_INDICATOR_COLUMN_MAP[key].key,
        })),
    ];
    const isSameDay = timeRange?.[0]?.isSame?.(timeRange?.[1]);
    const timeStr = timeRange?.[0] ? (isSameDay ? timeRange[0].format("YYYYMMDD") : `${timeRange[0].format("YYYYMMDD")}-${timeRange[1]?.format("YYYYMMDD")}`) : "export";
    ExportUtils.exportDynamicMerge([{ columns: exportColumns, dataSource: exportData, title: "客群属性排行榜" }], {
      fileName: `客群属性榜-${timeStr}`,
    });
  }, [flowRankingList, sortField, sortOrder, visibleIndicatorConfig, timeRange]);

  return (
    <div className="flow-ranking-page flow-ranking-page--face">
      <div className="flow-ranking-page__search-bar">
        <Space size="middle" wrap className="flow-ranking-page__filters">
          <div className="flow-ranking-page__filter-item">
            <span className="flow-ranking-page__filter-label">时间：</span>
            <TimeGranulePicker onTimeChange={setTimeRange} />
          </div>
          <div className="flow-ranking-page__filter-item">
            <span className="flow-ranking-page__filter-label">集团：</span>
            <TreeSelect
              allowClear
              showSearch
              treeNodeFilterProp="label"
              treeData={groupOptions || []}
              treeCheckable
              treeCheckStrictly
              multiple
              placeholder="请选择集团"
              value={selectedGroups}
              onChange={(v, _, c) => {
                const rawList = Array.isArray(v) ? v : [];
                const newVal = rawList.map((item) => (typeof item === "object" && item?.value != null ? item.value : item));
                const allGroupIds = collectAllGroupValues(groupOptions || []);
                const isAllGroupsSelected = allGroupIds.length > 0 && allGroupIds.every((id) => newVal.includes(id));
                const isAllChecked = c.triggerValue === "all";

                if (selectedGroups.includes("all")) {
                  // 已勾选「全部」
                  if (isAllChecked) {
                    // 取消「全部」时全部取消勾选
                    setSelectedGroups([]);
                  } else if (!isAllGroupsSelected) {
                    // 取消部分集团时，取消「全部」
                    setSelectedGroups(newVal.filter((x) => x !== "all"));
                  }
                } else if (isAllGroupsSelected) {
                  // 手动勾选全部集团时，自动勾选「全部」
                  setSelectedGroups(["all", ...allGroupIds]);
                } else if (isAllChecked) {
                  // 手动勾选「全部」时，自动勾选全部集团
                  setSelectedGroups(["all", ...allGroupIds]);
                } else {
                  setSelectedGroups(newVal);
                }
              }}
              showCheckedStrategy={TreeSelect.SHOW_ALL}
              maxTagCount={1}
              style={{ minWidth: 280 }}
            />
          </div>
          <div className="flow-ranking-page__filter-item">
            <span className="flow-ranking-page__filter-label">基准时间：</span>
            <Select value={baseTime} onChange={setBaseTime} options={baseTimeOptions} style={{ width: 150 }} placeholder="请选择" />
          </div>
          <Button type="primary" onClick={requestGroupFlowRanking}>
            {Language.CHAXUN}
          </Button>
          <div style={{ marginLeft: "8px", cursor: "pointer", userSelect: "none" }} onClick={() => setExpand(!expand)}>
            <span style={{ marginRight: "4px", color: showFilterColor ? "#1890ff" : "#333" }}>{expand ? "收起" : "展开"}</span>
            {expand ? (
              <UpOutlined style={{ color: showFilterColor ? "#1890ff" : "#333", fontSize: "12px" }} />
            ) : (
              <DownOutlined style={{ color: showFilterColor ? "#1890ff" : "#333", fontSize: "12px" }} />
            )}
          </div>
        </Space>
        <div className={`flow-ranking-page__filter-expand ${expand ? "flow-ranking-page__filter-expand-open" : ""}`}>
          <div className="flow-ranking-page__filter-row">
            <span className="flow-ranking-page__filter-label">性别筛选：</span>
            {genderEnumsOptions.map((item) => (
              <div
                className={`flow-ranking-page__filter-btn ${genderSelect.includes(item.value) ? "flow-ranking-page__filter-btn--selected" : ""}`}
                key={item.value}
                onClick={() => setGenderFunction(item.value)}>
                {item.label}
              </div>
            ))}
          </div>
          <div className="flow-ranking-page__filter-row">
            <span className="flow-ranking-page__filter-label">年龄筛选：</span>
            {ageEnumsOptions.map((item) => (
              <div
                className={`flow-ranking-page__filter-btn ${ageSelect.includes(item.value) ? "flow-ranking-page__filter-btn--selected" : ""}`}
                key={item.value}
                onClick={() => setAgeFunction(item.value)}>
                {item.label}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="noScroll" style={{ flex: 1, overflow: "auto" }}>
        <div className="flow-ranking-page__table-wrapper">
          <UIContentLoading loading={loading}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div className="flow-ranking-page__stats-period">统计周期: {statsPeriodText}</div>
              <div className="flow-ranking-page__table-actions">
                <Button className="flow-ranking-page__config-btn" onClick={() => setConfigModalOpen(true)}>
                  指标配置
                </Button>
                <Button type="primary" onClick={handleExport}>
                  导出数据
                </Button>
              </div>
            </div>
            <Table
              className="flow-ranking-page__table"
              columns={columns}
              dataSource={sortedFlowRankingList}
              pagination={{
                total: sortedFlowRankingList.length,
                current: currentPage,
                pageSize,
                showSizeChanger: true,
                showQuickJumper: true,
                pageSizeOptions: ["12", "24", "48"],
                showTotal: (total) => `共${total}条`,
                locale: {
                  items_per_page: `条/页`,
                  jump_to: "跳至",
                  page: "页",
                },
              }}
              onChange={(pagination, filters, sorter) => {
                setCurrentPage(pagination.current);
                setPageSize(pagination.pageSize || 12);
                const field = sorter?.field ?? sorter?.columnKey;
                if (field && sorter?.order) {
                  setSortField(field);
                  setSortOrder(sorter.order);
                } else {
                  const firstKey = indicatorConfig[0] || "boyCount";
                  setSortField(firstKey);
                  setSortOrder("descend");
                }
              }}
            />
            <FaceIndicatorConfigModal open={configModalOpen} onClose={() => setConfigModalOpen(false)} value={indicatorConfig} onApply={handleIndicatorConfigApply} />
          </UIContentLoading>
        </div>
        <ICPComponent style={{ height: "auto", paddingTop: "14px" }} />
      </div>
    </div>
  );
});

export default VenueRanking;

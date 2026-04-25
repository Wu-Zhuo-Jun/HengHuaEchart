import React, { useState, useRef, useCallback } from "react";
import { Drawer, Flex, Input, Select, Tabs, Button, Table, Radio, message } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { UIContent, UIModalConfirm } from "@/components/ui/UIComponent";
import { NetDataTable, DataTable } from "@/components/common/tables/Table";
import { Language } from "@/language/LocaleContext";
import Http from "@/config/Http";
import Constant from "@/common/Constant";
import TimeUtils from "@/utils/TimeUtils";

const PAGE_SIZES = Constant.PAGE_SIZES;

// 每个 Tab 独立 queryModel 默认值
const QUERY_DEFAULT = { state: 0, dir: 0, search: "", page: 1, limit: PAGE_SIZES[0], sort: null };

// Tab type 映射：Tab key -> API type
const TAB_TYPE_MAP = { 1: 1, 2: 2, 3: -1 };

// 映射状态选项
const STATE_OPTIONS = [
  { value: 0, label: "全部" },
  { value: -1, label: "未映射" },
  { value: 1, label: "已映射" },
];

// 进出方向选项
const DIR_OPTIONS = [
  { value: 0, label: "全部" },
  { value: 1, label: "正向" },
  { value: 2, label: "反向" },
];

// 上报规则映射
const RULE_TYPE_MAP = {
  1: "人数统计",
  2: "区域统计",
  3: "停留统计",
};

// 设备列表 Drawer（内联子组件）
const DeviceDrawer = React.memo(({ open, data, onClose }) => {
  const [pager] = useState({ current: 1, pageSize: PAGE_SIZES[0], total: data?.devices?.length ?? 0 });

  if (!open) return null;

  return (
    <Drawer width="80%" destroyOnHidden onClose={onClose} open={open} title="绑定设备列表" footer={null} styles={{ body: { paddingBottom: "24px" } }}>
      {data && (
        <Flex vertical gap={12}>
          <div style={{ fontSize: "16px", fontWeight: 600, color: "#1f2d3d" }}>{data.doorName}</div>
          <DataTable rowKey="deviceId" dataSource={data.devices ?? []} pager={pager} style={{ height: "auto" }} scroll={{ x: "max-content", y: "400px" }}>
            <Table.Column title="序列号" dataIndex="serialNumber" width="auto" align="center" />
            <Table.Column title="上报规则" dataIndex="ruleType" width="auto" align="center" render={(val) => RULE_TYPE_MAP[val] ?? val ?? "-"} />
            <Table.Column title="规则名称" dataIndex="ruleName" width="auto" align="center" />
          </DataTable>
        </Flex>
      )}
    </Drawer>
  );
});

// 主组件
export default function DoorAssociationDrawer({ open, siteId, areaId, areaName, onClose }) {
  const [activeTab, setActiveTab] = useState("1");
  const [loading, setLoading] = useState(false);
  const [dataList, setDataList] = useState([]);
  const [pager, setPager] = useState({ current: 1, pageSize: PAGE_SIZES[0], total: 0 });

  // 三个 Tab 各自维护独立 queryModel（用 state 保证 React 感知更新）
  const [queryModels, setQueryModels] = useState({
    1: { ...QUERY_DEFAULT },
    2: { ...QUERY_DEFAULT },
    3: { ...QUERY_DEFAULT },
  });

  // 关联 Tab 专有状态
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [batchModalOpen, setBatchModalOpen] = useState(false);
  const [batchType, setBatchType] = useState(null);

  // 设备列表 Drawer
  const [deviceDrawerOpen, setDeviceDrawerOpen] = useState(false);
  const [deviceDrawerData, setDeviceDrawerData] = useState(null);

  // 当前 Tab 的 queryModel
  const getCurrentModel = () => queryModels[activeTab];

  // 格式化列表
  const formatList = (list) => {
    return list.map((item) => ({
      ...item,
      createTimeDesc: item.createTime ? TimeUtils.ts2Date(item.createTime, "yyyy-MM-dd HH:mm:ss") : "-",
      otherLocations: buildOtherLocations(item),
    }));
  };

  const buildOtherLocations = (item) => {
    const parts = [];
    if (item.isAllType === 1) parts.push("总客流");
    if (item.isOutType === 1) parts.push("场外客流");
    if (item.isFloorType === 1) parts.push("楼层客流");
    return parts.length > 0 ? parts.join("、") : "-";
  };

  // 请求数据
  const requestData =
    // useCallback(
    (tabKey) => {
      if (!open || !siteId || !areaId) return;
      const tab = tabKey ?? activeTab;
      const model = queryModels[tab];
      const type = TAB_TYPE_MAP[tab];
      const params = {
        type,
        siteId,
        areaId,
        state: model.state,
        dir: model.dir,
        search: model.search || undefined,
        page: model.page,
        limit: model.limit,

        // type:类型, -1=可关联出入口 0=已关联出入口 1=已关联入区计数口 2=已关联外部计数口
        // siteId:场地id,
        // areaId:区域id,
        // state:映射状态 0=全部 -1=未映射 1=已映射
        // dir:进出方向 1=正向 2=反向
        // search: 查找关键字,可缺省参数
        // page:页码,
        // limit:每页行数,
        // sort:关联时间排序 -1=降序 1=升序(type=0,1,2时生效)
      };
      if (model.sort != null) params.sort = model.sort;

      setLoading(true);
      Http.getAreaDoors(
        params,
        (res) => {
          setLoading(false);
          if (res.result === 1) {
            const list = Array.isArray(res.data) ? res.data : res.data?.data ?? [];
            setDataList(formatList(list));
            const total = res.data?.pager?.count ?? (model.page - 1) * model.limit + list.length;
            setPager((p) => ({ ...p, current: model.page, pageSize: model.limit, total }));
          } else {
            message.error(res.msg ?? "请求失败");
            setDataList([]);
          }
        },
        null,
        () => {
          setLoading(false);
          message.error("网络请求失败");
          setDataList([]);
        }
      );
    };
  // ,[open, siteId, areaId, activeTab]);

  // open 变化时自动请求 Tab1
  React.useEffect(() => {
    if (open) {
      setActiveTab("1");
      setQueryModels({
        1: { ...QUERY_DEFAULT },
        2: { ...QUERY_DEFAULT },
        3: { ...QUERY_DEFAULT },
      });
      setSelectedRowKeys([]);
      requestData();
    }
  }, [open]);

  // Tab 切换：重置该 Tab 的分页，重新请求
  const onTabChange = (key) => {
    setActiveTab(key);
    setQueryModels((prev) => ({ ...prev, [key]: { ...prev[key], page: 1, sort: null } }));
    setSelectedRowKeys([]);
    Promise.resolve().then(() => requestData(key));
  };

  // 筛选条件变化
  const onChangeFilter = (key, value) => {
    setQueryModels((prev) => ({ ...prev, [activeTab]: { ...prev[activeTab], [key]: value } }));
  };

  // 查询
  const onClickQuery = () => {
    setQueryModels((prev) => ({ ...prev, [activeTab]: { ...prev[activeTab], page: 1 } }));
    Promise.resolve().then(() => requestData());
  };

  // 重置
  const onClickReset = () => {
    setQueryModels((prev) => ({ ...prev, [activeTab]: { ...QUERY_DEFAULT } }));
    Promise.resolve().then(() => requestData());
  };

  // 分页变化
  const onChangePage = (page, pageSize) => {
    setQueryModels((prev) => ({ ...prev, [activeTab]: { ...prev[activeTab], page, limit: pageSize } }));
    Promise.resolve().then(() => requestData());
  };

  // 排序变化
  const onChangeTable = (pagination, filters, sorter) => {
    const sortVal = sorter?.order === "ascend" ? 1 : sorter?.order === "descend" ? -1 : null;
    setQueryModels((prev) => ({ ...prev, [activeTab]: { ...prev[activeTab], sort: sortVal } }));
    Promise.resolve().then(() => requestData());
  };

  // 解除关联
  const onClickUnlink = (record) => {
    UIModalConfirm({
      title: Language.JINGGAO,
      content: "解除后将影响区域后续增量数据，该出入口对应平面图上的映射点位也将一并删除，是否继续？",
      onOk: (close) => {
        close({ okButtonProps: { loading: true } });
        Http.removeAssocDoor(
          { siteId, areaId, doorIds: record.doorId },
          (res) => {
            if (res.result === 1) {
              message.success("解除关联成功");
              requestData();
            } else {
              message.error(res.msg ?? "解除关联失败");
            }
            close({ okButtonProps: { loading: false } });
          },
          null,
          () => {
            message.error("网络请求失败");
            close({ okButtonProps: { loading: false } });
          }
        );
      },
    });
  };

  // 单条关联
  const onClickSingleAssoc = (record, assocType) => {
    const typeLabel = assocType === 1 ? "入区计数口" : "外部计数口";
    UIModalConfirm({
      title: Language.JINGGAO,
      content: `正在将【${record.doorName}】关联为【${typeLabel}】，是否继续？`,
      onOk: (close) => {
        close({ okButtonProps: { loading: true } });
        Http.addAssocDoor(
          { siteId, areaId, doorIds: record.doorId, type: assocType },
          (res) => {
            if (res.result === 1) {
              message.success("关联成功");
              setSelectedRowKeys([]);
              if (activeTab === "3") {
                setActiveTab("1");
                setQueryModels((prev) => ({ ...prev, 1: { ...prev[1], page: 1 } }));
                Promise.resolve().then(() => requestData("1"));
              } else {
                Promise.resolve().then(() => requestData());
              }
            } else {
              message.error(res.msg ?? "关联失败");
            }
            close({ okButtonProps: { loading: false } });
          },
          null,
          () => {
            message.error("网络请求失败");
            close({ okButtonProps: { loading: false } });
          }
        );
      },
    });
  };

  // 批量关联确认（一次请求，doorIds 逗号分隔）
  const onConfirmBatchAssoc = () => {
    if (selectedRowKeys.length === 0) {
      message.warning("请先选择要关联的出入口");
      return;
    }
    if (!batchType) {
      message.warning("请选择关联类型");
      return;
    }
    UIModalConfirm({
      title: Language.JINGGAO,
      content: `正在将选中的 ${selectedRowKeys.length} 个出入口关联为【${batchType === 1 ? "入区计数口" : "外部计数口"}】，是否继续？`,
      onOk: (close) => {
        close({ okButtonProps: { loading: true } });
        Http.addAssocDoor(
          { siteId, areaId, doorIds: selectedRowKeys.join(","), type: batchType },
          (res) => {
            close({ okButtonProps: { loading: false } });
            if (res.result === 1) {
              message.success("批量关联成功");
              setBatchModalOpen(false);
              setSelectedRowKeys([]);
              setBatchType(null);
              if (activeTab === "3") {
                setActiveTab("1");
                setQueryModels((prev) => ({ ...prev, 1: { ...prev[1], page: 1 } }));
                Promise.resolve().then(() => requestData("1"));
              } else {
                requestData();
              }
            } else {
              message.error(res.msg ?? "批量关联失败");
              close({ okButtonProps: { loading: false } });
            }
          },
          null,
          () => {
            message.error("网络请求失败");
            close({ okButtonProps: { loading: false } });
          }
        );
      },
    });
  };

  // 打开设备列表 Drawer
  const onClickOpenDeviceDrawer = (record) => {
    setDeviceDrawerData(record);
    setDeviceDrawerOpen(true);
  };

  // 当前筛选条件（用于 UI 显示）
  const currentModel = getCurrentModel();

  // 筛选条：Tab3 隐藏 state 和 dir 筛选
  const renderFilterBar = () => (
    <UIContent style={{ backgroundColor: "#edf3ff", height: "48px", width: "100%", marginBottom: "12px" }}>
      <Flex align="center" justify="space-between" style={{ height: "100%" }}>
        <Flex gap={12} align="center">
          <Input
            prefix={<SearchOutlined />}
            placeholder="请输入出入口名称"
            style={{ width: "257px", height: "36px" }}
            value={currentModel.search}
            onChange={(e) => onChangeFilter("search", e.target.value)}
            onPressEnter={onClickQuery}
          />
          {activeTab !== "3" && (
            <div>
              <span>映射状态：</span>
              <Select options={STATE_OPTIONS} value={currentModel.state} style={{ width: "145px", height: "36px" }} onChange={(val) => onChangeFilter("state", val)} />
            </div>
          )}
          <div>
            <span>进出方向：</span>
            <Select options={DIR_OPTIONS} value={currentModel.dir} style={{ width: "145px", height: "36px" }} onChange={(val) => onChangeFilter("dir", val)} />
          </div>
        </Flex>
        <Flex gap={12}>
          <Button type="primary" className="btn-primary" onClick={onClickQuery}>
            {Language.CHAXUN}
          </Button>
          <Button type="primary" className="btn-primary-s1" onClick={onClickReset}>
            {Language.CHONGZHI}
          </Button>
        </Flex>
      </Flex>
    </UIContent>
  );

  // 入区计数口 / 外部计数口 Tab 内容（共用列）
  const renderDoorTab = () => (
    <div style={{ padding: "16px 0" }}>
      <NetDataTable loading={loading} rowKey="doorId" dataSource={dataList} pager={pager} onChangePage={onChangePage} onChangeTable={onChangeTable} scroll={{ x: "max-content", y: "600px" }}>
        <Table.Column title="出入口名称" dataIndex="doorName" align="center" width="auto" minWidth="180px" />
        <Table.Column
          title="绑定设备"
          align="center"
          width="auto"
          minWidth="200px"
          render={(_, record) => {
            const devices = record.devices ?? [];
            const mainSerial = devices[0]?.serialNumber ?? "-";
            const extraCount = devices.length - 1;
            if (extraCount > 0) {
              return (
                <span>
                  {mainSerial}
                  <span style={{ color: "#0052d9", cursor: "pointer", marginLeft: "6px" }} onClick={() => onClickOpenDeviceDrawer(record)}>
                    (+{extraCount})
                  </span>
                </span>
              );
            }
            return <span>{mainSerial}</span>;
          }}
        />
        <Table.Column title="映射状态" dataIndex="state" align="center" width="auto" minWidth="100px" render={(val) => (val === -1 ? "未映射" : val === 1 ? "已映射" : "-")} />
        <Table.Column title="进出方向" dataIndex="dir" align="center" width="auto" minWidth="100px" render={(val) => (val === 1 ? "正向" : val === 2 ? "反向" : "-")} />
        <Table.Column title="其他关联位置" dataIndex="otherLocations" align="center" width="auto" minWidth="180px" />
        <Table.Column title="关联时间" dataIndex="createTimeDesc" align="center" width="auto" minWidth="240px" sorter showSorterTooltip={false} />
        <Table.Column
          title="操作"
          align="center"
          width="auto"
          minWidth="120px"
          render={(_, record) => (
            <div style={{ color: "#ff4d4f", cursor: "pointer" }} onClick={() => onClickUnlink(record)}>
              解除关联
            </div>
          )}
        />
      </NetDataTable>
    </div>
  );

  // 关联 Tab 内容
  const renderAssocTab = () => (
    <div style={{ padding: "16px 0" }}>
      <Flex align="center" gap={16} style={{ marginBottom: "12px" }}>
        <Button
          type="primary"
          className="btn-primary"
          onClick={() => {
            if (selectedRowKeys.length === 0) {
              message.warning("请先选择要关联的出入口");
              return;
            }
            setBatchType(null);
            setBatchModalOpen(true);
          }}>
          批量关联
        </Button>
        <span style={{ color: "#666", fontSize: "14px" }}>已选 {selectedRowKeys.length} 个出入口</span>
      </Flex>
      {batchModalOpen && (
        <div style={{ background: "#f5f5f5", padding: "16px", borderRadius: "4px", marginBottom: "12px" }}>
          <Flex align="center" gap={12}>
            <span>关联为：</span>
            <Radio.Group
              value={batchType}
              onChange={(e) => setBatchType(e.target.value)}
              options={[
                { value: 1, label: "入区计数口" },
                { value: 2, label: "外部计数口" },
              ]}
              optionType="button"
              buttonStyle="solid"
            />
            <Button type="primary" className="btn-primary" onClick={onConfirmBatchAssoc}>
              确认
            </Button>
            <Button
              type="primary"
              className="btn-primary-s2"
              onClick={() => {
                setBatchModalOpen(false);
                setBatchType(null);
              }}>
              取消
            </Button>
          </Flex>
        </div>
      )}
      <NetDataTable
        loading={loading}
        rowKey="doorId"
        dataSource={dataList}
        pager={pager}
        onChangePage={onChangePage}
        onChangeTable={() => {}}
        rowSelection={{
          selectedRowKeys,
          onChange: (keys) => setSelectedRowKeys(keys),
        }}
        scroll={{ x: "max-content", y: "500px" }}>
        <Table.Column title="出入口名称" dataIndex="doorName" align="center" width="auto" minWidth="180px" />
        <Table.Column title="绑定设备" align="center" width="auto" minWidth="200px" render={(_, record) => <span>{record.devices?.[0]?.serialNumber ?? "-"}</span>} />
        <Table.Column title="进出方向" dataIndex="dir" align="center" width="auto" minWidth="100px" render={(val) => (val === 1 ? "正向" : val === 2 ? "反向" : "-")} />
        <Table.Column title="其他关联位置" dataIndex="otherLocations" align="center" width="auto" minWidth="180px" />
        <Table.Column
          title="操作"
          align="center"
          width="auto"
          minWidth="200px"
          render={(_, record) => (
            <Flex align="center" justify="center" gap={8}>
              <Button size="small" type="primary" className="btn-primary-s4" onClick={() => onClickSingleAssoc(record, 1)}>
                入区计数
              </Button>
              <Button size="small" type="primary" className="btn-primary-s4" onClick={() => onClickSingleAssoc(record, 2)}>
                外部计数
              </Button>
            </Flex>
          )}
        />
      </NetDataTable>
    </div>
  );

  const tabItems = [
    { key: "1", label: "入区计数口", children: renderDoorTab() },
    { key: "2", label: "外部计数口", children: renderDoorTab() },
    { key: "3", label: "关联出入口", children: renderAssocTab() },
  ];

  return (
    <>
      <Drawer width="80%" destroyOnHidden open={open} onClose={onClose} title={`出入口关联 | ${areaName}`} footer={null}>
        {/* 筛选条 */}
        {renderFilterBar()}

        {/* Tabs */}
        <Tabs activeKey={activeTab} onChange={onTabChange} items={tabItems} />
      </Drawer>

      {/* 设备列表 Drawer */}
      <DeviceDrawer open={deviceDrawerOpen} data={deviceDrawerData} onClose={() => setDeviceDrawerOpen(false)} />
    </>
  );
}

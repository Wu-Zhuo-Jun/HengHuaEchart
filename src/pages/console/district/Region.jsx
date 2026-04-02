import React, { useEffect, useState, useRef } from "react";
import { UIContent, UIModalConfirm } from "@/components/ui/UIComponent";
import { NetDataTable } from "@/components/common/tables/Table";
import { Language } from "@/language/LocaleContext";
import { Button, Flex, Input, Popover, Select, Table } from "antd";
import { DownOutlined, SearchOutlined } from "@ant-design/icons";
import { DeviceDrawer, EditAreasDrawer } from "./LocalComponent";
import DoorAssociationDrawer from "./DoorAssociationDrawer";
import Http from "@/config/Http";
import Constant from "@/common/Constant";
import Message from "@/components/common/Message";
import TimeUtils from "@/utils/TimeUtils";
import Selection from "@/common/Selection";

const RegionModel = {
  queryModel: {
    page: 1,
    limit: Constant.PAGE_SIZES[0],
    search: null,
    sort: null,
    state: 0,
  },
  resetQueryModel: () => {
    RegionModel.queryModel = {
      page: 1,
      limit: Constant.PAGE_SIZES[0],
      search: null,
      sort: null,
      state: 0,
    };
  },
};

// 区域管理列表组件：负责区域查询、分页、编辑与删除等交互。
const Region = ({ site, onClickOperate, updateTime, onOpenPlanGraph }) => {
  const planGraphicStatus = Selection.getPlanGraphicStatusSelection();
  const defaultPlanGraphicState = planGraphicStatus?.[0]?.value ?? 0;
  const [deviceDrawerOpen, setDeviceDrawerOpen] = useState(false);
  const [deviceDrawerData, setDeviceDrawerData] = useState(null);
  const [openEditAreasDrawer, setOpenEditAreasDrawer] = useState(false);
  const [editAreasData, setEditAreasData] = useState(null);
  const [editAreasLoading, setEditAreasLoading] = useState(false);
  const [doorAssocDrawerOpen, setDoorAssocDrawerOpen] = useState(false);
  const [doorAssocDrawerArea, setDoorAssocDrawerArea] = useState(null);
  const [pager, setPager] = useState({ current: 1, pageSize: Constant.PAGE_SIZES[0], total: 0 });
  const [queryData, setQueryData] = useState({ state: defaultPlanGraphicState, search: null });
  const queryDataRef = useRef({ state: defaultPlanGraphicState, search: null });

  const [regionList, setAreasList] = useState([]);
  const [loading, setLoading] = useState(false);

  // 监听站点或更新时间变化，刷新区域列表（重置到第一页，保留当前筛选条件）。
  useEffect(() => {
    if (!site?.siteId) return;
    RegionModel.queryModel.search = queryDataRef.current?.search ?? null;
    RegionModel.queryModel.state = queryDataRef.current?.state ?? defaultPlanGraphicState;
    RegionModel.queryModel.page = 1;
    requestQueryAreas();
  }, [site?.siteId, updateTime]);

  // 关闭编辑抽屉，可选触发列表刷新。
  const onCloseEditAreasDrawer = (update = false) => {
    setOpenEditAreasDrawer(false);
    setEditAreasData(null);
    setEditAreasLoading(false);
    if (update) {
      requestQueryAreas();
    }
  };

  // 打开编辑抽屉并注入当前区域及可选设备数据。
  const onClickEditAreas = (region) => {
    setOpenEditAreasDrawer(true);
    setEditAreasData(null);
    setEditAreasLoading(true);

    Http.getArea(
      { siteId: site?.siteId, areaId: region.areaId },
      (res) => {
        if (res.result === 1) {
          const areaData = res.data ?? {};
          setEditAreasData({
            ...areaData,
            areaId: areaData.areaId ?? region.areaId,
            siteId: areaData.siteId ?? site?.siteId,
            siteName: site?.siteName,
            floorOptions: site?.floors ?? [],
          });
        } else {
          Message.error(res.msg ?? "获取区域详情失败");
        }
        setEditAreasLoading(false);
      },
      null,
      () => {
        Message.error("网络请求失败");
        setEditAreasLoading(false);
      }
    );
  };

  // 删除区域：二次确认后调用删除接口并刷新列表。
  const onClickDeleteAreas = (regionId) => {
    let modal = UIModalConfirm({
      title: Language.JINGGAO,
      content: Language.SHANCHUCHURUKOU_TIP,
      onOk: (close) => {
        modal.update({ okButtonProps: { loading: true } });
        requestDeleteAreas({ areaId: regionId }, (res) => {
          if (res.result == 1) {
            Message.success(Language.SHANCHUCHURUKOUCHENGGONG);
            modal.destroy();
            requestQueryAreas();
          } else {
            Message.error(res.msg);
          }
          modal.update({ okButtonProps: { loading: false } });
        });
      },
    });
  };
  // 新增区域入口：透传给父组件处理。
  const onClickAddAreas = (siteId) => {
    onClickOperate("addAreas", siteId);
  };
  // 打开热区（设备）列表抽屉。
  const onClickOpenDeviceList = (region) => {
    setDeviceDrawerOpen(true);
    setDeviceDrawerData(region);
  };
  // 关闭热区（设备）列表抽屉。
  const onCloseDeviceDrawer = () => {
    setDeviceDrawerOpen(false);
  };

  // 打开出入口关联抽屉。
  const onClickOpenDoorAssoc = (record) => {
    setDoorAssocDrawerArea(record);
    setDoorAssocDrawerOpen(true);
  };

  const onCloseDoorAssocDrawer = () => {
    setDoorAssocDrawerOpen(false);
    setDoorAssocDrawerArea(null);
  };

  // 更新查询条件中的单个字段。
  const onChangeQuery = (key, value) => {
    const nextQueryData = { ...queryDataRef.current, [key]: value };
    queryDataRef.current = nextQueryData;
    setQueryData(nextQueryData);
  };

  // 表格排序变化回调：转换排序方向并重新请求数据。
  const onChangeTable = (pagination, filters, sorter) => {
    if (sorter?.order === "ascend") RegionModel.queryModel.sort = 1;
    else if (sorter?.order === "descend") RegionModel.queryModel.sort = -1;
    else RegionModel.queryModel.sort = null;
    requestQueryAreas();
  };

  // 分页变化回调：按新页码和每页条数重新查询。
  const onChangePage = (page, pageSize) => {
    RegionModel.queryModel.page = page;
    RegionModel.queryModel.limit = pageSize;
    requestQueryAreas();
  };

  // 重置查询条件为默认值并重新查询。
  const onClickReset = () => {
    const nextQueryData = { state: defaultPlanGraphicState, search: null };
    queryDataRef.current = nextQueryData;
    setQueryData(nextQueryData);
    RegionModel.resetQueryModel();
    RegionModel.queryModel.state = defaultPlanGraphicState;
    RegionModel.queryModel.page = 1;
    requestQueryAreas();
  };

  // 执行查询：回到第一页并带上当前筛选条件。
  const onClickQuery = () => {
    RegionModel.queryModel.search = queryDataRef.current?.search ?? null;
    RegionModel.queryModel.state = queryDataRef.current?.state ?? defaultPlanGraphicState;
    RegionModel.queryModel.page = 1;
    requestQueryAreas();
  };

  // 请求区域列表并格式化返回数据，同时更新分页信息。
  const requestQueryAreas = () => {
    if (!site?.siteId) return;
    const params = {
      siteId: site.siteId,
      search: RegionModel.queryModel.search ?? undefined,
      state: RegionModel.queryModel.state ?? defaultPlanGraphicState,
      page: RegionModel.queryModel.page,
      limit: RegionModel.queryModel.limit,
    };
    if (RegionModel.queryModel.sort != null) {
      params.sort = RegionModel.queryModel.sort;
    }

    setLoading(true);
    Http.getSiteAreas(
      params,
      (res) => {
        setLoading(false);
        if (!res) {
          Message.error("请求异常");
          setAreasList([]);
          return;
        }
        if (res.result == 1) {
          const list = Array.isArray(res.data) ? res.data : res.data?.data ?? [];
          const regions = formatAreasList(list);
          setAreasList(regions);
          // 接口不返回 pager，由组件根据请求参数和当前页数据计算分页
          const { page, limit } = RegionModel.queryModel;
          const total = (page - 1) * limit + regions.length;
          setPage(page, limit, total);
        } else {
          Message.error(res.msg ?? "请求失败");
          setAreasList([]);
        }
      },
      null,
      () => {
        setLoading(false);
        Message.error("网络请求失败");
        setAreasList([]);
      }
    );
  };

  const setPage = (page, pageSize, total) => {
    RegionModel.queryModel.page = page;
    RegionModel.queryModel.limit = pageSize;
    setPager({ current: page, pageSize: pageSize, total: total });
  };

  // 获取站点下的设备列表。
  const requestSiteDeviceList = (params, success) => {
    Http.getSiteDeviceList(params, success);
  };

  // 删除指定区域。
  const requestDeleteAreas = (params, success) => {
    Http.deleteAreas(params, success);
  };

  // 格式化区域列表字段
  const formatAreasList = (regionList) => {
    if (!regionList || !regionList.length) return [];
    return regionList.map((region, index) => {
      const createTime = Number(region.createTime) || 0;
      const imgState = Number(region.imgState);
      const imgStateDesc = imgState === -1 ? "待上传" : imgState === 1 ? "已上传" : "-";
      return {
        ...region,
        areaId: region.areaId ?? region.id ?? `area-${index}`,
        name: region.name ?? "",
        hsCount: Number(region.hsCount) || 0,
        dCount: Number(region.dCount) || 0,
        imgState,
        imgStateDesc,
        createTime,
        createTimeDesc: TimeUtils.ts2Date(createTime, "yyyy-MM-dd HH:mm:ss"),
      };
    });
  };

  return (
    <Flex vertical style={{ flex: 1, minWidth: 0, marginRight: 12 }} gap={15}>
      <UIContent style={{ backgroundColor: "#edf3ff", height: "48px", width: "100%" }}>
        <Flex vertical gap={15}>
          <Flex align="center" justify="space-between">
            <Flex gap={30} align="center">
              <Flex gap={19} align="center">
                <Input
                  prefix={<SearchOutlined />}
                  placeholder={Language.QINGSHURUQUYUMINGCHENG}
                  style={{ width: "257px", height: "36px" }}
                  value={queryData?.search ?? ""}
                  onChange={(e) => onChangeQuery("search", e.target.value)}
                  onPressEnter={onClickQuery}
                />
                <div>{Language.PINGMIANTUZHUANGTAI}:</div>
                <Select options={planGraphicStatus} value={queryData?.state} defaultValue={0} style={{ width: "145px", height: "35px" }} onChange={(value) => onChangeQuery("state", value)} />
              </Flex>
              <Flex gap={19} align="center">
                <Button type="primary" className="btn-primary" onClick={onClickQuery}>
                  {Language.CHAXUN}
                </Button>
                <Button type="primary" className="btn-primary-s1" onClick={onClickReset}>
                  {Language.CHONGZHI}
                </Button>
              </Flex>
            </Flex>
            <Button type="primary" className="btn-primary-s3" onClick={() => site?.siteId && onClickAddAreas(site.siteId)}>
              新增区域
            </Button>
          </Flex>
        </Flex>
      </UIContent>
      <div style={{ padding: 2 }}>
        <NetDataTable
          loading={loading}
          rowKey="areaId"
          style={{ height: "auto" }}
          scroll={{ x: "max-content", y: "700px" }}
          pager={pager}
          dataSource={regionList}
          onChangePage={onChangePage}
          onChangeTable={onChangeTable}>
          <Table.Column title="区域名称" key="name" dataIndex="name" align="center" width={"auto"} minWidth="200px" />
          <Table.Column
            title="从属热区"
            key="hsCount"
            dataIndex="hsCount"
            align="center"
            width={"auto"}
            minWidth="140px"
            render={(value, record, index) => {
              let item = <div>{value}</div>;
              if (value > 0) {
                item = (
                  <div style={{ color: "#0052d9", cursor: "pointer" }} onClick={() => onClickOpenDeviceList(record)}>
                    {value}
                  </div>
                );
              }
              return <>{item}</>;
            }}
          />
          <Table.Column title="关联出入口" key="dCount" dataIndex="dCount" align="center" width={"auto"} minWidth="200px" />
          <Table.Column title="平面图状态" key="imgStateDesc" dataIndex="imgStateDesc" align="center" width={"auto"} minWidth="100px" />
          <Table.Column title={Language.CHUANGJIANSHIJIAN} key="createTimeDesc" dataIndex="createTimeDesc" align="center" sorter showSorterTooltip={false} width={"auto"} minWidth="240px" />
          <Table.Column
            title={Language.CAOZUO}
            key="operation"
            align="center"
            width={"auto"}
            minWidth="200px"
            render={(value, record, index) => {
              return (
                <Flex align="center" justify="center" gap={8}>
                  <div
                    className="font-style-1-16"
                    style={{
                      color: "#0052d9",
                      cursor: "pointer",
                    }}
                    onClick={() => onClickOpenDoorAssoc(record)}>
                    出入口关联
                  </div>

                  <div
                    className="font-style-1-16"
                    style={{
                      color: "#0052d9",
                      cursor: "pointer",
                    }}
                    onClick={() => onOpenPlanGraph?.(record)}>
                    平面图映射
                  </div>

                  <Popover
                    trigger="click"
                    placement="bottom"
                    content={
                      <Flex vertical>
                        <div
                          className="font-style-1-16"
                          style={{
                            color: "#0052d9",
                            cursor: "pointer",
                            lineHeight: "20px",
                            padding: "6px 12px",
                          }}
                          onClick={() => onClickEditAreas(record)}>
                          {Language.BIANJI}
                        </div>
                        <div
                          className="font-style-1-16"
                          style={{
                            color: "#ff4d4f",
                            cursor: "pointer",
                            lineHeight: "20px",
                            padding: "6px 12px",
                          }}
                          onClick={() => onClickDeleteAreas(record.areaId)}>
                          {Language.SHANCHU}
                        </div>
                      </Flex>
                    }
                    styles={{
                      body: {
                        padding: "4px 0px",
                      },
                    }}>
                    <Flex
                      align="center"
                      gap={4}
                      style={{
                        cursor: "pointer",
                        color: "#0052d9",
                      }}>
                      <div
                        className="font-style-1-16"
                        style={{
                          color: "#0052d9",
                        }}>
                        更多
                      </div>
                      <DownOutlined style={{ fontSize: "12px", color: "#0052d9" }} />
                    </Flex>
                  </Popover>
                </Flex>
              );
            }}
          />
        </NetDataTable>
      </div>
      <DeviceDrawer title={Language.SHEBEILIEBIAO} open={deviceDrawerOpen} door={deviceDrawerData} onClose={onCloseDeviceDrawer} />
      <EditAreasDrawer onClose={onCloseEditAreasDrawer} title="编辑区域" open={openEditAreasDrawer} areaData={editAreasData} loading={editAreasLoading} />
      <DoorAssociationDrawer
        open={doorAssocDrawerOpen}
        siteId={site?.siteId}
        areaId={doorAssocDrawerArea?.areaId}
        areaName={doorAssocDrawerArea?.name}
        onClose={onCloseDoorAssocDrawer}
      />
    </Flex>
  );
};

export default Region;

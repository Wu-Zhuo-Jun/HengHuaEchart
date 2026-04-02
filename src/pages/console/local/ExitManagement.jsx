import React, { use, useCallback, useEffect, useState, useRef } from 'react';
import { UIPageHeader, UIContent, UISelect, UIModalConfirm } from '../../../components/ui/UIComponent';
import { DataTable, NetDataTable } from '../../../components/common/tables/Table';
import { Language } from '../../../language/LocaleContext';
import { Button, Cascader, Divider, Flex, Input, Radio, Select, Table } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import DemoUtils from '../../../utils/DemoUtils';
import { SiteItemList, DeviceDrawer, EditDoorDrawer } from './LocalComponent';
import Http from '../../../config/Http';
import Constant from '../../../common/Constant';
import Message from '../../../components/common/Message';
import TimeUtils from '../../../utils/TimeUtils';
import locale from 'antd/es/date-picker/locale/en_US';
import Selection from '../../../common/Selection';

const ExitManagementModel = {
    queryModel: {
        page: 1,
        limit: Constant.PAGE_SIZES[0],
        allNumber: 1,
        search: null,
        sort: 0,
        direction: null,
    },
}

const ExitManagement = ({ site, onClickOperate, updateTime }) => {
    console.log('ExitManagement', site);
    const directionOptions = Selection.getDoorDirectionSelection();
    const [deviceDrawerOpen, setDeviceDrawerOpen] = useState(false);
    const [deviceDrawerData, setDeviceDrawerData] = useState(null);
    const [openEditDoorDrawer, setOpenEditDoorDrawer] = useState(false);
    const [editDoorData, setEditDoorData] = useState(null);
    const [deviceList, setDeviceList] = useState([]);
    // const [pager, setPager] = useState({
    //     page: 1,
    //     limit: Constant.PAGE_SIZES[0],
    //     total: 0,
    // });
    const [queryData, setQueryData] = useState({});
    const [query, setQuery] = useState({
        pager: { current: 1, pageSize: Constant.PAGE_SIZES[0], total: 0 },
    });

    const [doorList, setDoorList] = useState([]);

    useEffect(() => {
        requestSiteDeviceList({ siteId: site.siteId }, (res) => {
            if (res.result == 1) {
                setDeviceList(res.data);
            }
            requestGetDoorList({...query,siteId:site.siteId });
        });
    }, [site, updateTime]);

    const onCloseEditDoorDrawer = (update=false) => {
        setOpenEditDoorDrawer(false);
        if(update){
            requestGetDoorList(query);
        }
        // setEditDoorData(null);
    }

    const onClickEditDoor = (door) => {
        setOpenEditDoorDrawer(true);
        setEditDoorData({ ...door, siteName: site.siteName, floorOptions: site.floors, deviceOptions: getDeviceOptions(door.devices, deviceList) });
    }

    const onClickDeleteDoor = (doorId) => {
        let modal = UIModalConfirm({
            title:Language.JINGGAO,
            content:Language.SHANCHUCHURUKOU_TIP,
            onOk:(close)=>{
                modal.update({okButtonProps:{loading:true}});
                requestDeleteDoor({ doorId: doorId }, (res) => {
                    if (res.result == 1) {
                        Message.success(Language.SHANCHUCHURUKOUCHENGGONG);
                        modal.destroy();
                        requestGetDoorList(query);
                    }else{
                        Message.error(res.msg);
                    }
                    modal.update({okButtonProps:{loading:false}});
                })
            },
        });
        // onClickOperate('delete', doorId);
    }
    const onClickAddDoor = (siteId) => {
        onClickOperate('addDoor', siteId);
    }
    const onClickOpenDeviceList = (door) => {
        setDeviceDrawerOpen(true);
        setDeviceDrawerData(door);
    }
    const onCloseDeviceDrawer = () => {
        setDeviceDrawerOpen(false);
    }

    const onEditDoor = (door) => {
        setEditDoorData({ ...door, deviceOptions: getDeviceOptions(door.devices, deviceList) });
    }

    const onChangeQuery = (key, value) => {
        setQueryData({ ...queryData, [key]: value });
    }

    const onChangeTable = (pagination, filters, sorter) => {
        let sort = null;
        if (sorter.order == "ascend") {
            sort = 1;
        } else if (sorter.order == "descend") {
            sort = -1;
        }
        requestGetDoorList({...query,sort:sort});
    }

    const onChangePage = (page, pageSize) => {
        console.log('onChangePage', query);
        requestGetDoorList({ ...query, pager: {...query.pager, current: page, pageSize: pageSize } });
    }

    const onClickReset = () => {
        setQueryData({...queryData,direction:directionOptions[0].value,search:null});
    }

    const onClickQuery = () => {
        // console.log('onClickQuery', query);
        requestGetDoorList({...query,pager: { current: 1, pageSize: query.pager.pageSize, total: 0 },...queryData});
    }

    const requestGetDoorList = (query) => {
        // setQuery(query);
        let params = {
            siteId:query.siteId,
            search: query.search,
            direction: query.direction,
            page: query.pager.current,
            limit: query.pager.pageSize,
            allNumber: 1,
        }

        Http.getDoorList(params, (res) => {
            if (res.result == 1) {
                let doors = formatDoorList(res.data.data);
                setDoorList(doors);
                let pager = res.data.pager;
                setQuery({...query,pager:{current:pager.page,pageSize:pager.limit,total:pager.count}})
            } else {
                Message.error(res.msg);
                setDoorList([]);
            }
        });
    }

    const requestSiteDeviceList = (params, success) => {
        Http.getSiteDeviceList(params, success);
    }

    const requestDeleteDoor = (params,success)=>{
        Http.deleteDoor(params,success);
    }

    const setPager = (page, pageSize, total) => {
        setQuery({ ...query, pager: { current: page, pageSize: pageSize, total: total } });
    }

    const getDeviceOptions = (devices, deviceList) => {
        let deviceIds = devices?.map((device) => {
            return device.deviceId;
        });
        deviceList.map((device) => {
            if (deviceIds?.includes(device.deviceId)) {
                device.disabled = true;
            } else {
                device.disabled = false;
            }
            return device;
        });
       
        return deviceList;
    }

    const formatDoorList = (doorList) => {
        doorList.map((door) => {
            door.createTime = Number(door.createTime);
            door.createTimeDesc = TimeUtils.ts2Date(door.createTime, 'yyyy-MM-dd HH:mm:ss');
            door.direction = Number(door.direction);
            if (door.direction == -1) {
                door.directionDesc = Language.FANXIANG;
            } else if (door.direction == 1) {
                door.directionDesc = Language.ZHENGXIANG
            }
            let location = new Array();
            door.isAllType = Number(door.isAllType);
            door.isOutType = Number(door.isOutType);
            door.isFloorType = Number(door.isFloorType);
            if (door.isAllType == 1) {
                location.push(Language.ZONGKELIU);
            }
            if (door.isOutType == 1) {
                location.push(Language.CHANGWAIKELIU);
            }
            if (door.floors) {
                if (door.floors.length > 0) {
                    for (let i = 0; i < door.floors.length; i++) {
                        location.push(door.floors[i].floorName);
                    }
                }
            }else{
                door.floors = [];
            }

            if (location.length == 0) {
                door.location = Language.ZANWU;
            } else {
                door.location = location.join(' , ');
            }
            if (door.devices) {
                door.deviceCount = door.devices.length;
            }else{
                door.deviceCount = 0;
                door.devices = [];
            }
        });
        return doorList;
    }

    return (
        <Flex vertical style={{ flex: 1, minWidth: 0 }} gap={15}>
            <UIContent style={{ backgroundColor: '#edf3ff', height: '48px', width: '100%' }}>
                <Flex vertical gap={15}>
                    <Flex align='center' justify='space-between'>
                        <Flex gap={30} align='center'>
                            <Flex gap={19} align='center'>
                                <div>{Language.JINCHUFANGXIANG}:</div>
                                <Select options={directionOptions} value={queryData?.direction} defaultValue={0} style={{ width: '145px', height: '35px' }} onChange={(value)=>onChangeQuery('direction',value)} />
                                <Input prefix={<SearchOutlined />} placeholder={Language.CHURUKOUMINGCHENG} style={{ width: '257px', height: '36px' }} value={queryData?.search} onChange={(e)=>onChangeQuery('search',e.target.value)} />
                            </Flex>
                            <Flex gap={19} align='center'>
                                <Button type='primary' className='btn-primary' onClick={onClickQuery} >{Language.CHAXUN}</Button>
                                <Button type='primary' className='btn-primary-s1' onClick={onClickReset}>{Language.CHONGZHI}</Button>
                            </Flex>
                        </Flex>
                        <Button type='primary' className='btn-primary-s3' onClick={() => onClickAddDoor(site.siteId)}>{Language.XINZENGCHURUKOU}</Button>
                    </Flex>
                </Flex>
            </UIContent>
            <div style={{ paddingRight: '15px' }}>
                <NetDataTable responsive rowKey='doorId' style={{ height: 'auto' }} scroll={{ x: 'max-content', y: '680px' }} pager={query?.pager} dataSource={doorList} onChangePage={onChangePage} onChangeTable={onChangeTable}>
                    <Table.Column title={Language.CHURUKOUMINGCHENG} dataIndex='doorName' width={'auto'} minWidth='200px' />
                    <Table.Column title={Language.SHEBEISHU} dataIndex='deviceCount' width={'auto'} minWidth='140px' align='center' render={(value, record, index) => {
                        let item = <div>{value}</div>;
                        if (value > 0) {
                            item = <div style={{ color: '#0052d9', cursor: 'pointer' }} onClick={() => onClickOpenDeviceList(record)}>{value}</div>
                        }
                        return (
                            <>{item}</>
                        );
                    }} />
                    <Table.Column title={Language.JINCHUFANGXIANG} dataIndex='directionDesc' width={'auto'} minWidth='200px' />
                    <Table.Column title={Language.GUANLIANWEIZHI} dataIndex='location' width={'auto'} minWidth='350px' />
                    <Table.Column title={Language.CHUANGJIANSHIJIAN} dataIndex='createTimeDesc' width={'auto'} minWidth='240px' align='center' sorter showSorterTooltip={false} />
                    <Table.Column title={Language.CAOZUO} width={'auto'} minWidth='200px' align='center' render={(value, record, index) => {
                        return (
                            <Flex align='center' justify='center' gap={10}>
                                <div className='font-style-1-16' style={{
                                    cursor: 'pointer',
                                }} onClick={() => onClickEditDoor(record)}>{Language.BIANJI}</div>
                                <div style={{
                                    width: '1px',
                                    backgroundColor: '#3867d6',
                                    height: '10px',

                                }}></div>
                                <div className='font-style-1-16' style={{
                                    color: 'red',
                                    cursor: 'pointer',
                                }} onClick={() => onClickDeleteDoor(record.doorId)}>{Language.SHANCHU}</div>
                            </Flex>
                        )
                    }} />
                </NetDataTable>
            </div>
            <DeviceDrawer title={Language.SHEBEILIEBIAO} open={deviceDrawerOpen} door={deviceDrawerData} onClose={onCloseDeviceDrawer} />
            <EditDoorDrawer onClose={onCloseEditDoorDrawer} title={Language.BIANJICHURUKOU} open={openEditDoorDrawer} door={editDoorData} onEditDoor={onEditDoor} />
        </Flex>
    );
}

export default ExitManagement;
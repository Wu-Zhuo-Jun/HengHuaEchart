import React, { use, useCallback, useEffect, useState, useRef } from 'react';
import { UIPageHeader, UIContent, UISelect, UITitle, UIModalConfirm } from '../../../components/ui/UIComponent';
import { DataTable, NetDataTable } from '../../../components/common/tables/Table';
import { Language,text} from '../../../language/LocaleContext';
import { Button, Cascader, Divider, Flex, Input, Radio, Select, Table, Tabs } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import DemoUtils from '../../../utils/DemoUtils';
import {EditDoorDrawer} from './LocalComponent';
import Selection from '../../../common/Selection';
import Constant from '../../../common/Constant';
import Http from '../../../config/Http';
import TimeUtils from '../../../utils/TimeUtils';
import Message from '../../../components/common/Message';

const FlowManagement = ({ site,type, onClickOperate }) => {
    const [openEditDoorDrawer, setOpenEditDoorDrawer] = useState(false);
    const [editDoorData, setEditDoorData] = useState(null);
    const [tableSelectedKeys, setTableSelectedKeys] = useState([]);
    const [tabKey, setTabKey] = useState(1);
    const [queryData,setQueryData] = useState({});
    const [query, setQuery] = useState(
        {
          siteId: site.siteId,
          type:type,
          assoc:1,
          pager: { current: 1, pageSize: Constant.PAGE_SIZES[0], total: 0 },
        }
      );
    const [doorList, setDoorList] = useState([]);
    const [deviceList, setDeviceList] = useState([]);
    const directionOptions = Selection.getDoorDirectionSelection();
    const tabItems = [
        {
            key:1,
            label:Language.YIGUANLIANCHURUKOU
        },
        {
            key:-1,
            label:Language.KEGUANLIANCHURUKOU
        },
    ]


    useEffect(() => {
        if(type == 1 || type == 2){
            requestSiteDeviceList({ siteId: site.siteId }, (res) => {
                if (res.result == 1) {
                    setDeviceList(res.data);
                }
                requestGetDoorList({...query,siteId:site.siteId});
            });
        }
    },[site]);

    useEffect(() => {
    },[]);

    const onCloseEditDoorDrawer = (update) => {
        setOpenEditDoorDrawer(false);
        if(update){
            requestGetDoorList(query);
        }
    }

    const onClickEditDoor = (door) => {
        console.log("onClickEditDoor", door);
        setOpenEditDoorDrawer(true);
        setEditDoorData({ ...door, siteName: site.siteName, floorOptions: site.floors, deviceOptions: getDeviceOptions(door.devices, deviceList) });
    }
    const onClickRemoveAssoc = (doorId) => {
        // onClickOperate('delete', doorId);
        let modal = UIModalConfirm(
            {
                title:Language.JINGGAO,
                content:Language.JIECHUCHURUKOUGUANLIAN_TIP,
                onOk:(close)=>{
                    modal.update({okButtonProps:{loading:true}});
                    if(type == 1 || type == 2){
                        let params = {
                            doorIds:doorId,
                            siteId:site.siteId,
                            assoc:-1,
                        }
                        requestSetDoorType(params, (res) => {
                            if(res.result == 1){
                                Message.success(Language.JIECHUGUANLIANCHENGGONG);
                                requestGetDoorList(query);
                                modal.destroy();
                            }else{
                                Message.error(res.msg);
                            }
                            modal.update({okButtonProps:{loading:false}});
                        });
                    }
                },
            }
        )
    }

    const onClickAddAssoc = (doorId) => {
        let modal = UIModalConfirm(
            {
                title:Language.TISHI,
                content:Language.JIECHUCHURUKOUGUANLIAN_TIP,
                onOk:(close)=>{
                    modal.update({okButtonProps:{loading:true}});
                    if(type == 1 || type == 2){
                        let params = {
                            doorIds:doorId,
                            siteId:site.siteId,
                            assoc:1,
                        }
                        requestSetDoorType(params, (res) => {
                            if(res.result == 1){
                                Message.success(Language.GUANLIANCHENGGONG);
                                requestGetDoorList(query);
                                modal.destroy();
                            }else{
                                Message.error(res.msg);
                            }
                            modal.update({okButtonProps:{loading:false}});
                        });
                    }
                },
            }
        )
    }

    const onTabClick = (key) => {
        setTabKey(key);
        setTableSelectedKeys([]);
        setDoorList([]);
        requestGetDoorList({...query,pager:{current:1,pageSize:query.pager.pageSize,total:0},assoc:key});
    }
    useEffect(() => {
        console.log(tableSelectedKeys);
    }, [tableSelectedKeys]);

    const onSelectTable = (record,selected,selectedRows,nativeEvent)=>{
        if(selected){
            if(!tableSelectedKeys.includes(record.doorId)){
                setTableSelectedKeys([...tableSelectedKeys,record.doorId]);
                
            }
        }else{
            setTableSelectedKeys(tableSelectedKeys.filter(doorId=>doorId!==record.doorId));
        }
    }
    const onSelectAllTable = (selected,selectedRows,changeRows)=>{
        let selectedKeys = [];
        for(let i=0;i<changeRows.length;i++){
            selectedKeys.push(changeRows[i].doorId);
        }
        if(selected){
            setTableSelectedKeys([...tableSelectedKeys,...selectedKeys]);
        }else{
            setTableSelectedKeys(tableSelectedKeys.filter(doorId=>!selectedKeys.includes(doorId)));
        }
    }

    const onChangePage = (current, pageSize) => {
        requestGetDoorList({...query, pager: {...query.pager, current: current, pageSize: pageSize } });
    }

    const onChangeTable = (pagination, filters, sorter, extra) => {
    }

    const onChangeQuery = (key, value) => {
        setQueryData({...queryData,[key]:value});
    }

    const onClickQuery = () => {
        setTableSelectedKeys([]);
        requestGetDoorList({...query,pager: { current: 1, pageSize: query.pager.pageSize, total: query.pager.total },...queryData});
    }

    const onClickReset = () => {
        setQueryData(
            {
                search:null,
                direction:directionOptions[0].value,
            }
        );
    }

    const onEditDoor = (door) => {
        setEditDoorData({ ...door, deviceOptions: getDeviceOptions(door.devices, deviceList) });
    }

    const onClickMutipleAssoc =()=>{
        if(tableSelectedKeys.length == 0){
            Message.warning(Language.QINGXIANXUANZHONGCHURUKOU);
        }else{
            let modal = UIModalConfirm(
                {
                    title:Language.TISHI,
                    content:Language.JIECHUCHURUKOUGUANLIAN_TIP,
                    onOk:(close)=>{
                        modal.update({okButtonProps:{loading:true}});
                        if(type == 1 || type == 2){
                            let params = {
                                doorIds:tableSelectedKeys.join(','),
                                siteId:site.siteId,
                                assoc:1,
                            }
                            requestSetDoorType(params, (res) => {
                                if(res.result == 1){
                                    Message.success(Language.GUANLIANCHENGGONG);
                                    requestGetDoorList(query);
                                    setTableSelectedKeys([]);
                                    modal.destroy();
                                }else{
                                    Message.error(res.msg);
                                }
                                modal.update({okButtonProps:{loading:false}});
                            });
                        }
                    },
                }
            )
        }
    }

    const requestGetDoorList=(query)=>{
        // setQuery(query);
        const params = {
            siteId: query.siteId,
            search: query.search,
            direction: query.direction,
            assoc: query.assoc,
            page: query.pager.current,
            limit: query.pager.pageSize,
            allNumber: 1,
          };
        let httpFunc = Http.getDoorAllTypeList;
        if(type == 2){
            httpFunc = Http.getDoorOutTypeList;
        }
        httpFunc.call(null,params,(res)=>{
            if(res.result == 1){
                let doors = formatDoorList(res.data.data);
                setDoorList(doors);
                let pager = res.data.pager;
                setQuery({...query, pager: { current: pager.page, pageSize: pager.limit, total: pager.count } });
            }else{
                Message.error(res.msg);
            }
        });
    }

     const requestSiteDeviceList = (params, success) => {
            Http.getSiteDeviceList(params, success);
        }

    const requestSetDoorType = (params, success) => {
        if(type == 1){
            Http.setDoorAllType(params, success);
        }else if(type == 2){
            Http.setDoorOutType(params, success);
        }
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

    return (
        <Flex vertical style={{ flex: 1, minWidth: 0 }} gap={15}>
            <UIContent style={{ backgroundColor: '#edf3ff', height: '48px', width: '100%' }}>
                <Flex vertical gap={15}>
                    <Flex align='center' justify='space-between'>
                        <Flex gap={30} align='center'>
                            <Flex gap={19} align='center'>
                                <div>{Language.JINCHUFANGXIANG}:</div>
                                <Select options={directionOptions} defaultValue={directionOptions[0].value} value={queryData?.direction} style={{ width: '145px', height: '35px' }} onChange={(value) => onChangeQuery('direction', value)} />
                                <Input prefix={<SearchOutlined />} value={queryData?.search} placeholder={Language.CHURUKOUMINGCHENG} style={{ width: '257px', height: '36px' }} onChange={(e) => onChangeQuery('search', e.target.value)}/>
                            </Flex>
                            <Flex gap={19} align='center'>
                                <Button type='primary' className='btn-primary' onClick={onClickQuery}>{Language.CHAXUN}</Button>
                                <Button type='primary' className='btn-primary-s1' onClick={onClickReset}>{Language.CHONGZHI}</Button>
                            </Flex>
                        </Flex>
                    </Flex>
                </Flex>
            </UIContent>
            <UIContent style={{flex:1,paddingLeft: '0px',paddingRight: '0px'}}>
                <Tabs items={tabItems} tabBarStyle={{ padding: '0px 25px' }} onTabClick={onTabClick}/>
                <div style={{ padding: '0px 10px' }}>
                   {tabKey==-1 && <Flex align='center' gap={10} style={{marginBottom:'10px'}}> 
                        <Button type='pramary' className='btn-primary-s3' style={{height:'34px',lineHeight:'34px'}} onClick={onClickMutipleAssoc}>{Language.PILIANGGUANLIAN}</Button>
                        <UITitle>{text(Language.PARAM_YIXUANXIANG,{value:tableSelectedKeys.length})}</UITitle>
                   </Flex>}
                   {tabKey == 1 && <NetDataTable onChangePage={onChangePage} onChangeTable={onChangeTable} responsive rowKey='doorId' style={{ height: 'auto' }} scroll={{ x: 'max-content', y: '600px' }} pager={query.pager} dataSource={doorList} >
                        <Table.Column title={Language.CHURUKOUMINGCHENG} dataIndex='doorName' width={'auto'} minWidth='200px' />
                        <Table.Column title={Language.SHEBEISHU} dataIndex='deviceCount' width={'auto'} minWidth='140px' align='center'/>
                        <Table.Column title={Language.JINCHUFANGXIANG} dataIndex='directionDesc' width={'auto'} minWidth='200px' />
                        <Table.Column title={Language.GUANLIANWEIZHI} dataIndex='location' width={'auto'} minWidth='350px' />
                        <Table.Column title={Language.CHUANGJIANSHIJIAN} dataIndex='createTimeDesc' width={'auto'} minWidth='240px' align='center' />
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
                                    }} onClick={() => onClickRemoveAssoc(record.doorId)}>{Language.JIECHUGUANLIAN}</div>
                                </Flex>
                            )
                        }} />
                    </NetDataTable>} 
                   {tabKey == -1 && <NetDataTable onChangePage={onChangePage} onChangeTable={onChangeTable} rowSelection={{columnWidth:'40px',type:'checkbox',selectedRowKeys:tableSelectedKeys,onSelect:onSelectTable,onSelectAll:onSelectAllTable}} rowKey='doorId' style={{ height: 'auto' }} scroll={{ x: 'max-content', y: '600px' }} pager={query.pager} dataSource={doorList} >
                        <Table.Column title={Language.CHURUKOUMINGCHENG} dataIndex='doorName' width={'auto'} minWidth='200px' />
                        <Table.Column title={Language.SHEBEISHU} dataIndex='deviceCount' width={'auto'} minWidth='140px' align='center' />
                        <Table.Column title={Language.JINCHUFANGXIANG} dataIndex='directionDesc' width={'auto'} minWidth='200px' />
                        <Table.Column title={Language.GUANLIANWEIZHI} dataIndex='location' width={'auto'} minWidth='350px' />
                        <Table.Column title={Language.CHUANGJIANSHIJIAN} dataIndex='createTimeDesc' width={'auto'} minWidth='240px' align='center' />
                        <Table.Column title={Language.CAOZUO} width={'auto'} minWidth='200px' align='center' render={(value, record, index) => {
                            return (
                                <div className='font-style-1-16' style={{
                                    cursor: 'pointer',
                                }} onClick={() => onClickAddAssoc(record.doorId)}>{Language.GUANLIANCHURUKOU}</div>
                            )
                        }} />
                    </NetDataTable>} 
                </div>
            </UIContent>
           <EditDoorDrawer onClose={onCloseEditDoorDrawer} title={Language.BIANJICHURUKOU} open={openEditDoorDrawer} door={editDoorData} onEditDoor={onEditDoor}/>
        </Flex>
    );
}

export default FlowManagement;
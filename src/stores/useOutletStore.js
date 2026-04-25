import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import Http from "@/config/Http";
import { outletObj, outletTree } from "@/pages/flow/outletComparison/const";
import dayjs from "dayjs";

/**
 * 出入口公共状态管理
 * 用于管理根据场地变化获取的出入口列表
 * 选定出入口分析
 */
const useOutletStore = create(
  // persist 是 Zustand 提供的一个中间件，用于将 store 的状态持久化（如存到 localStorage、sessionStorage、IndexedDB 等），
  // 从而在页面刷新后保持部分或全部状态不丢失。
  // immer 是另一个 Zustand 中间件，借助 immer 库，让你可以按照“可变”的写法（直接修改 state），
  // 但实际上是在底层以不可变数据结构确保状态管理的安全可靠。这使得 reducer 写起来更加直观，无需手动展开或复制对象/数组。
  persist(
    immer((set, get) => ({
      // 出入口数据状态
      outletList: JSON.parse(JSON.stringify(outletObj)), // 出入口列表
      analyseDoorType: "ALL", // 出入口类型 ALL FLOOR
      // outletTree: JSON.parse(JSON.stringify(outletTree)), // 出入口树形结构
      // analyseDoorId: null, // 选定出入口ID
      analyseDoorId: [], // 选定出入口ID
      analyseTimeRange: null, // 选定出入口分析时间范围（使用 null 避免序列化问题）
      loading: false, // 加载状态
      error: null, // 错误信息
      currentSiteId: null, // 当前场地ID

      /**
       * 根据场地ID获取出入口列表
       * @param {string|number} siteId - 场地ID
       * @param {boolean} forceRefresh - 是否强制刷新（忽略缓存）
       */
      fetchOutletList: async (siteId, forceRefresh = false) => {
        // 如果场地ID与当前相同、已有数据、且非强制刷新，则不重复请求
        if (!forceRefresh && get().currentSiteId === siteId && get().outletList.ALL.children.length > 0) {
          return;
        }

        set((state) => {
          state.loading = true;
          state.error = null;
        });

        try {
          const result = await new Promise((resolve, reject) => {
            Http.getCompareDoorListData({ siteId }, resolve, null, reject);
          });

          if (result.result === 1) {
            set((state) => {
              // 深拷贝初始结构
              const list = JSON.parse(JSON.stringify(outletObj));
              const tree = JSON.parse(JSON.stringify(outletTree));

              // 清空之前的children数组
              Object.keys(list).forEach((key) => {
                list[key].children = [{ label: "全选", value: "ALL", key: "ALL", disabled: false }];
              });
              Object.keys(tree).forEach((key) => {
                tree[key].children = [];
              });

              // 填充数据
              result.data.forEach((item) => {
                const node = {
                  label: item.doorName,
                  value: item.doorId,
                  key: item.doorId,
                };
                const treeNode = {
                  title: item.doorName,
                  children: [],
                };

                if (item.isAllType === 1) {
                  list.ALL.children.push(node);
                  // treeNode.key = `ALL_${item.doorId}`;
                  // treeNode.value = `ALL_${item.doorId}`;
                  tree[0].children.push({ ...treeNode, value: `ALL_${item.doorId}`, key: `ALL_${item.doorId}` });
                }
                // if (item.isOutType === 1) {
                //   list.OUTSIDE.children.push(node);
                //   // treeNode.key = `OUTSIDE_${item.doorId}`;
                //   // treeNode.value = `OUTSIDE_${item.doorId}`;
                //   tree[1].children.push({ ...treeNode, value: `OUTSIDE_${item.doorId}`, key: `OUTSIDE_${item.doorId}` });
                // }
                if (item.isFloorType === 1) {
                  list.FLOOR.children.push(node);
                  // treeNode.key = `FLOOR_${item.doorId}`;
                  // treeNode.value = `FLOOR_${item.doorId}`;
                  tree[1].children.push({ ...treeNode, value: `FLOOR_${item.doorId}`, key: `FLOOR_${item.doorId}` });
                }
              });

              state.outletList = list;
              state.outletTree = tree;
              state.currentSiteId = siteId;
              state.loading = false;
              state.error = null;
            });
          } else {
            set((state) => {
              state.loading = false;
              state.error = result.msg || "获取出入口列表失败";
            });
          }
        } catch (error) {
          console.error("获取出入口列表失败:", error);
          set((state) => {
            state.loading = false;
            state.error = error.message || "网络请求失败";
          });
        }
      },

      /**
       * 根据出入口类型获取对应的出入口列表
       * @param {string} type - 出入口类型 (ALL/OUTSIDE/FLOOR)
       * @returns {Array} 出入口列表
       */
      getOutletsByType: (type) => {
        return get().outletList[type]?.children || [];
      },

      /**
       * 根据出入口ID获取出入口名称
       * @param {string|number} doorId - 出入口ID
       * @returns {string} 出入口名称
       */
      getOutletNameById: (doorId) => {
        const outletList = get().outletList;
        for (const type in outletList) {
          const children = outletList[type].children || [];
          const door = children.find((item) => item.value === doorId);
          if (door) {
            return door.label;
          }
        }
        return `出入口${doorId}`;
      },

      /**
       * 重置出入口数据
       */
      resetOutletList: () => {
        set((state) => {
          state.outletList = JSON.parse(JSON.stringify(outletObj));
          state.loading = false;
          state.error = null;
          state.currentSiteId = null;
        });
      },

      /**
       * 强制刷新出入口列表
       * 清除缓存后重新请求接口获取最新数据
       */
      refreshOutletList: () => {
        const siteId = get().currentSiteId;
        if (siteId) {
          set((state) => {
            // 重置列表为空（保留全选选项）
            Object.keys(state.outletList).forEach((key) => {
              state.outletList[key].children = [{ label: "全选", value: "ALL", key: "ALL", disabled: false }];
            });
          });
          get().fetchOutletList(siteId, true);
        }
      },

      /**
       * 清除错误信息
       */
      clearError: () => {
        set((state) => {
          state.error = null;
        });
      },

      /**
       * 清除选定的出入口分析数据
       * 用于每次进入出入口分析页面时重置选择状态
       */
      clearAnalyseSelection: () => {
        set((state) => {
          state.analyseDoorId = [];
          state.analyseTimeRange = [dayjs(), dayjs()];
        });
      },

      /**
       * 处理出入口选择变化事件
       * @param {string} type - 出入口类型 (ALL/FLOOR)
       * @param {Array} checkedValues - 选中的值
       * @param {Array} selectedIds - 已选的值
       * @param {Array} action - 操作类型
       * @returns {Array} newSelectedIds 选择器Ids
       * @returns {Array} actualIds 实际ids 无ALL
       *
       */
      handleOutletChange: (type, checkedValues, selectedIds = [], action = "select") => {
        const outletType = get().outletList[type];
        if (!outletType) return;

        // 检查是否选择了全选
        const isSelectAll = checkedValues === "ALL";
        let newSelectedIds = [];
        const allSelectedIds = outletType.children.filter((child) => child.value !== "ALL").map((child) => child.value);

        if (action === "select") {
          if (isSelectAll) {
            // 选择全选时，自动选择同级下的所有出入口ID
            newSelectedIds = outletType.children.map((child) => child.value);
          } else {
            newSelectedIds = [...selectedIds, checkedValues];
            // 判断 newSelectedIds 和 allSelectedIds 的值是否完全一样
            const isAllSelected = newSelectedIds.length === allSelectedIds.length && newSelectedIds.every((id) => allSelectedIds.includes(id));

            newSelectedIds = isAllSelected ? ["ALL", ...newSelectedIds] : newSelectedIds;
          }
        }

        if (action === "deselect") {
          newSelectedIds = isSelectAll ? [] : selectedIds.filter((item) => item !== checkedValues && item !== "ALL");
        }

        let actualIds = newSelectedIds.filter((item) => item !== "ALL");
        return { newSelectedIds, actualIds };
      },

      /**
       * 实际所选id
       * @param {string} selectedIds - 所选id
       * @returns {Array} 选中的出入口ID数组
       */
      getSelectedOutletIds: (selectedIds) => {
        return selectedIds.filter((value) => value !== "ALL");
      },
    })),
    {
      name: "outlet-storage-analyse", // sessionStorage key
      storage: createJSONStorage(() => sessionStorage), // 使用 sessionStorage
      partialize: (state) => ({
        outletList: state.outletList,
        outletTree: state.outletTree,
        currentSiteId: state.currentSiteId,
        analyseDoorId: state.analyseDoorId,
        analyseTimeRange: state.analyseTimeRange,
      }),
      version: 3, // 版本控制，增加版本号以清除旧数据
    }
  )
);

export default useOutletStore;

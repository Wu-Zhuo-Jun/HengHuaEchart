import { Language } from "../language/LocaleContext";
import Constant from "./Constant";

class Selection {
  static getDailyReportTimeInvertalSelection = (type) => {
    let options = [
      { label: Language.ANXIAOSHI, value: Constant.INTERVAL_TYPE.HOUR },
      { label: Language.ANWUFENZHONG, value: Constant.INTERVAL_TYPE.MINUTE },
    ];
    if (type == Constant.INTERVAL_TYPE.DAY) {
      options = [
        { label: Language.ANTIAN, value: Constant.INTERVAL_TYPE.DAY },
        { label: Language.ANXIAOSHI, value: Constant.INTERVAL_TYPE.HOUR },
      ];
    }
    const selection = {
      options: options,
      defaultValue: options[0].value,
    };
    return selection;
  };
  static getFlowTypeSelection = () => {
    let options = [
      { label: Language.JINCHANGRENCI, value: "inCount" },
      { label: Language.JINCHANGRENSHU, value: "inNum" },
      { label: Language.CHUCHANGRENCI, value: "outCount" },
      { label: Language.KELIUPICI, value: "batchCount" },
      { label: Language.JIKELI, value: "collectCount" },
      { label: Language.CHANGWAIKELIU, value: "outsideCount" },
      { label: Language.JINCHANGLV, value: "inRate" },
    ];
    const selection = {
      options: options,
      defaultValue: options[0].value,
    };
    return selection;
  };

  static getDoorDirectionSelection = () => {
    let selection = [
      {
        label: Language.QUANBU,
        value: 0,
      },
      {
        label: Language.ZHENGXIANG,
        value: 1,
      },
      {
        label: Language.FANXIANG,
        value: -1,
      },
    ];
    return selection;
  };

  static getPlanGraphicStatusSelection = () => {
    let selection = [
      {
        label: "全部",
        value: 0,
      },
      {
        label: "未上传",
        value: -1,
      },
      {
        label: "已上传",
        value: 1,
      },
    ];
    return selection;
  };
}

export default Selection;

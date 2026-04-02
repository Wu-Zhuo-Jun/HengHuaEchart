import { message } from "antd";
class Message {
  static success(content) {
    message.success({
        content: content,
        duration: 2,
    });
  }

  static error(content) {
    message.error({
        content: content,
        duration: 2,
    } );
  }

  static warning(content) {
    message.warning({
        content: content, 
        duration: 2,
    });
  }
}

export default Message;
import ChatList from "./chatList/ChatList";
import "./list.css";
import Userinfo from "./userInfo/Userinfo";

// 左边列表由用户信息和聊天列表组成
const List = () => {
  return (
    <div className="list">
      <Userinfo />
      <ChatList />
    </div>
  );
};

export default List;

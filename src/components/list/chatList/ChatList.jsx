import { useEffect, useState } from "react";
import "./chatList.css";
import AddUser from "./addUser/addUser";
import { useUserStore } from "../../../lib/userStore";
import { doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "../../../lib/firebase";
import { useChatStore } from "../../../lib/chatStore";

// 用户聊天列表
const ChatList = () => {
  const [chats, setChats] = useState([]);
  const [addMode, setAddMode] = useState(false);
  const [input, setInput] = useState("");

  const { currentUser } = useUserStore();
  const { chatId, changeChat } = useChatStore();

  // 使用 useEffect 钩子，在组件加载时订阅用户聊天数据的实时更新
  useEffect(() => {
    // 订阅 Firestore 中用户聊天数据的变化
    const unSub = onSnapshot(
      // 监听当前用户的聊天文档
      doc(db, "userchats", currentUser.id),
      async (res) => {
        // 获取 firebstore 中的聊天数据
        const items = res.data().chats;

        // 遍历每个聊天记录，获取聊天对象的用户数据
        const promises = items.map(async (item) => {
          // 获取聊天对象的用户文档引用
          const userDocRef = doc(db, "users", item.receiverId);
          // 从 firebase 获取用户文档快照
          const userDocSnap = await getDoc(userDocRef);

          // 获取用户数据
          const user = userDocSnap.data();

          // 将用户数据与聊天数据合并，返回新对象
          return { ...item, user };
        });

        // 等待所有用户数据获取完成
        const chatData = await Promise.all(promises);

        // 将聊天记录按照更新时间进行排序，
        setChats(chatData.sort((a, b) => b.updatedAt - a.updatedAt));
      }
    );

    return () => {
      // 在组件卸载时取消订阅
      unSub();
    };
  }, [currentUser.id]); //依赖 currentUser.id ，用户id变化时重新执行

  // 选择某个聊天时的处理函数
  const handleSelect = async (chat) => {
    // 去除聊天数据中的用户信息，保留其他聊天相关字段
    const userChats = chats.map((item) => {
      // 通过解构赋值去掉 user 字段
      const { user, ...rest } = item;
      return rest;
    });

    // 找到当前选中的聊天记录在数组中的索引
    const chatIndex = userChats.findIndex(
      (item) => item.chatId === chat.chatId
    );

    // 将该聊天记录标记为已读
    userChats[chatIndex].isSeen = true;

    // 获取当前用户的聊天记录文档引用
    const userChatsRef = doc(db, "userchats", currentUser.id);

    try {
      // 更新 firebase 中的聊天记录
      await updateDoc(userChatsRef, {
        chats: userChats,
      });
      // 更改当前的聊天 id 和聊天对象
      changeChat(chat.chatId, chat.user);
    } catch (err) {
      console.log(err);
    }
  };

  // 根据搜索框中的输入过滤聊天数据
  const filteredChats = chats.filter((c) =>
    c.user.username.toLowerCase().includes(input.toLowerCase())
  );

  return (
    <div className="chatList">
      <div className="search">
        <div className="searchBar">
          <img src="./search.png" alt="" />
          <input
            type="text"
            placeholder="搜索"
            onChange={(e) => setInput(e.target.value)}
          />
        </div>
        <img
          src={addMode ? "./minus.png" : "./plus.png"}
          alt=""
          className="add"
          onClick={() => setAddMode((prev) => !prev)}
        />
      </div>
      {filteredChats.map((chat) => (
        <div
          className="item"
          key={chat.chatId}
          onClick={() => handleSelect(chat)}
          style={{
            backgroundColor: chat?.isSeen
              ? "transparent"
              : "rgba(69, 85, 115, 0.5)",
          }}
        >
          <img
            src={
              chat.user.blocked.includes(currentUser.id)
                ? "./avatar.png"
                : chat.user.avatar || "./avatar.png"
            }
            alt=""
          />
          <div className="texts">
            <span>
              {chat.user.blocked.includes(currentUser.id)
                ? "用户"
                : chat.user.username}
            </span>
            <p>{chat.lastMessage}</p>
          </div>
        </div>
      ))}

      {addMode && <AddUser />}
    </div>
  );
};

export default ChatList;

export default {
  title: "个人笔记",
  description: "12312312",
  themeConfig: {
    socialLinks: [
      { icon: "github", link: "https://github.com/zhangxin187" },
    ],

    // 侧边栏菜单
    sidebar: [
      {
        text: "React",
        collapsible: true,
        items: [
          { text: "React知识点", link: "/react-learning" },
        ],
      },
      {
        text: "Vue",
        collapsible: true,
        items: [
          { text: "Vue知识点", link: "/vue-learning" },
        ],
      },
      {
        text: "面试问题总结",
        collapsible: true,
        items: [
          { text: "前端", link: "/other-learning" },
        ],
       
       
      },
    ],
  },
};

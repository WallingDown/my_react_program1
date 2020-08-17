import React, { Component,Fragment } from 'react'
import { Card, Button, Table, Tooltip } from 'antd'
import { PlusOutlined, FormOutlined, DeleteOutlined } from '@ant-design/icons'
import { reqNo1SubjectPaging,reqNo2SubjectById} from '@/api/edu/subject'
import './index.less'

export default class Subject extends Component {

    state = {
      no1SubjectInfo:{total:0,items:[]}, //一级分类数据
      pageSize:5, //每页条数
      loading:false,//默认是false
      expandedIds:[] //代表展开项的id组成的数组，初始值为空

    }

    componentDidMount(){
      //  初始化一级数据
      this.getNo1SubjectPaging()
    }

    // 请求所有一级分类的数据
    getNo1SubjectPaging = async (pageNumber=1,pageSize=this.state.pageSize)=> {
      // 展示loading
      this.setState({loading:true})
      // 请求一级分类数据
    // async getAllNo1SubjectPaging(pageNumber=1,pageSize=this.state.pageSize){
      const result = await reqNo1SubjectPaging(pageNumber,pageSize)
      // console.log(result)//{total: 11, items: Array(5)}
      let {total,items} = result
      // 给每一个一级分类追加children属性-----目的是让antd展开属性
      // subject 代表一个一级分类
      items = items.map((subject)=>{
        // 如果有children，说明这是一个一级分类
        subject.children = []
        return subject
      })
      this.setState({
        no1SubjectInfo:{total,items},
        expandedIds:[],//清空之前所展开的
        loading:false
      })
    }

    // 表格项展开+折叠的回调
    // expanded 是否展开
    handleExpand = async(ids) =>{
      // 获取状态中展开项的id的数组
      const {expandedIds,no1SubjectInfo} = this.state
      // 如果状态中展开项的id的数组的长度 小于 antDesign内置的帮我们计数的ids 
      // 说明一定是展开了，
      // 开始拿着id发请求，找最后一个 antDesign 内置的帮我们计数的ids数组中的那一项
      if (expandedIds.length < ids.length) {
        // 获取计数的ids数组中的最后一项 
        // const _id = ids.reverse()[0] 数据多不推荐用
          const _id = ids.slice(-1)[0] //截取最后一位返回一个数组，拿出它下标的第一位
          // 根据当前id找到当前操作的项
          const currentSubject = no1SubjectInfo.items.find(subject => subject._id === _id)
          // 如果存在当前分类，并且当前分类没有展开过
           if (currentSubject.children && !currentSubject.children.length) {
            this.setState({loading:true})
          // 根据一级分类id，获取一级分类下属的所有二级分类数据
          const no2SubjectInfo = await reqNo2SubjectById(_id)
          // 从状态中获取一级分类，no1SubjectInfo是一个对象
           const {no1SubjectInfo} = this.state
            // 加工一级分类数据，找到展开的一级分类，给其他的children属性赋值
           //  no1SubjectInfo是一个对象，他的items才是一个数组；subject 代表一级分类
           const arr =  no1SubjectInfo.items.map((subject)=>{
           // 如果一级分类的_id和点击请求回来的id相同，
           if (subject._id === _id) {
             // 那就往空的children里面添加二级分类的items
             subject.children = no2SubjectInfo.items
            //  如果二级分类的数组为空
             if (!no2SubjectInfo.items.length) {
              // 就删除展开项
               delete subject.children
             }
           }
           return subject
         })
         // 更新状态
           this.setState({
             no1SubjectInfo:{...no1SubjectInfo,items:arr},
             loading:false
            })
           }
      }
      // 把最新的展开项id数组（可能比之前展开的多也可能展开的少），维护进状态
      // 因此在 逻辑上要放在最后
      this.setState({expandedIds:ids})
      }
     

  render() {
    const {no1SubjectInfo,pageSize,expandedIds,loading} = this.state
    // 表格中的数据源（这里设置的是假数据，之后会通过请求从服务器获取数据）
    let dataSource = no1SubjectInfo.items
    //  表格的列配置（根据设计文档写）
    const columns = [
      {
        title: '分类名',
        dataIndex: 'title',//数据索引项————决定该列展示啥
        key: 'title',
      },
      {
        title: '操作',
        width: '200px',
        align: 'center',
        dataIndex: 'btn',
        key: 'btn',
        render: () => (
          <Fragment>
            <Tooltip placement="top" title="编辑分类">
            <Button type="primary" className="left-btn" icon={<FormOutlined />} />
            </Tooltip>
            <Tooltip placement="top" title="删除分类">
            <Button type="danger" icon={<DeleteOutlined />} />
            </Tooltip>
          </Fragment>
        )
      }
    ];
    return (
      <Card title={<Button type="primary" icon={<PlusOutlined />}>新增分类</Button>}>
        <Table 
        loading={loading}
        dataSource={dataSource}  // 指定表格的数据
        columns={columns}  //表格列的设置
        rowKey="_id" //指定的唯一标识
        // 翻页的属性expandable
        expandable={{
          // onExpand:this.handleExpand

          // onExpandedRowsChange 点击展开图标时触发
          onExpandedRowsChange:this.handleExpand,//指定展开的回调
          //展开的哪些项（由项id组成的数组）
          expandedRowKeys:expandedIds //expandedIds 初始值为空数组
        }}
        pagination={{ //分页器的配置
          total:no1SubjectInfo.total,//数据总数
          pageSize:pageSize, //每页条数,
          showSizeChanger:true,//是否显示每页条数的切换器
          pageSizeOptions:['3','4','5','10','15'],
          onShowSizeChange:(_,pageSize)=>{ //页大小改变的回调
            this.getNo1SubjectPaging(1,pageSize)
            this.setState({pageSize})
          },
          onChange:(pageNumber)=>{ //页码改变的回调
            // 发请求获取一级数据
            this.getNo1SubjectPaging(pageNumber)
          }
        }} 
        />
      </Card>
    )
  }
}

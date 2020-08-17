import React, { Component,Fragment } from 'react'
import { Card, Button, Table, Tooltip } from 'antd'
import { PlusOutlined, FormOutlined, DeleteOutlined } from '@ant-design/icons'
import { reqNo1SubjectPaging,reqNo2SubjectById} from '@/api/edu/subject'
import './index.less'

export default class Subject extends Component {

    state = {
      no1SubjectInfo:{total:0,items:[]}, //一级分类数据
      pageSize:4, //每页条数
      expandedIds:[]
    }

    componentDidMount(){
      //  初始化一级数据
      this.getNo1SubjectPaging()
    }

    // 请求所有一级分类的数据
    getNo1SubjectPaging = async (pageNumber=1,pageSize=this.state.pageSize) => {
    // async getAllNo1SubjectPaging(pageNumber=1,pageSize=this.state.pageSize){
      const result = await reqNo1SubjectPaging(pageNumber,pageSize)
      // console.log(result)//{total: 11, items: Array(5)}
      let {total,items} = result
      // 给每一个一级分类追加children属性-----目的是让antd展开属性
      items = items.map((subject)=>{
        subject.children = []
        return subject
      })
      this.setState({
        no1SubjectInfo:{total,items},
        expandedIds:[]//清空之前所展开的
      })
    }

    // 表格项展开+折叠的回调
    handleExpand = async(ids) =>{
      // 获取状态中展开项的id的数组
      const {expandedIds} = this.state
      // 如果展开了，发请求
      if (expandedIds.length < ids.length) {
          const _id = ids.slice(-1)[0]
           // 根据一级分类id，获取一级分类下属的所有二级分类数据
        const no2SubjectInfo = await reqNo2SubjectById(_id)
         // 从状态中获取一级分类
         const {no1SubjectInfo} = this.state
           // 加工一级分类数据，找到展开的一级分类，给其他的children属性赋值
        const arr =  no1SubjectInfo.items.map((subject)=>{
          if (subject._id === _id) {
            subject.children = no2SubjectInfo.items
          }
          return subject
        })
        // 维护进状态
          this.setState({no1SubjectInfo:{...no1SubjectInfo,items:arr}})
      }
      // 把最新的展开项id数组，维护进状态
      this.setState({expandedIds:ids})
      }
     

  render() {
    const {no1SubjectInfo,pageSize,expandedIds} = this.state
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
        dataSource={dataSource}  // 指定表格的数据
        columns={columns}  //表格列的设置
        rowKey="_id" //指定的唯一标识
        expandable={{
          // onExpand:this.handleExpand
          onExpandedRowsChange:this.handleExpand,//指定展开的回调
          expandedRowKeys:expandedIds//展开的哪些行（由项id组成的数组）
        }}
        pagination={{ //分页器的配置
          total:no1SubjectInfo.total,//数据总数
          pageSize:pageSize, //每页条数,
          showSizeChanger:true,//是否显示每页条数的切换器
          pageSizeOptions:['4','5','10','15'],
          onShowSizeChange:(_,pageSize)=>{ //页大小改变的回调
            this.getNo1SubjectPaging(1,pageSize)
            this.setState({pageSize})
          },
          onChange:(pageNumber)=>{ //页码改变的回调
            this.getNo1SubjectPaging(pageNumber)
          }
        }} 
        />
      </Card>
    )
  }
}

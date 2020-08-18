import React, { Component,Fragment } from 'react'
import { Card, Button, Table, Tooltip, Input,message,Modal } from 'antd'
import { PlusOutlined, FormOutlined, DeleteOutlined,QuestionCircleOutlined } from '@ant-design/icons'
import { 
  reqNo1SubjectPaging,
  reqNo2SubjectById,
  reqUpdateSubject,
  reqDeleteSubject} from '@/api/edu/subject'
import './index.less'
// 从Modal引入confirm提示组件
const {confirm} = Modal

export default class Subject extends Component {
    subjectRef = React.createRef()
    state = {
      no1SubjectInfo:{total:0,items:[]}, //一级分类数据
      pageSize:5, //每页条数
      loading:false,//默认是false
      expandedIds:[], //代表展开项的id组成的数组，初始值为空
      editId:'', //当前正在编辑分类的id
      editTitle:"",//当前正在编辑分类的title
      pageNumber:1//初始页码
    }

    componentDidMount(){
      //  初始化一级数据
      this.getNo1SubjectPaging()
    }

    // 请求所有一级分类的数据
    getNo1SubjectPaging = async (pageNumber=1,pageSize=this.state.pageSize)=> {
      // 展示loading
      this.setState({loading:true,pageSize,pageNumber})
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
     
    // 点击修改的确定按钮
    updateSubject = async() =>{
        const {editId,editTitle,no1SubjectInfo} = this.state
        //封装更新数据的方法
        const handleData = arr =>{
          return arr.map((subject)=>{
            if (subject._id === editId) {
              subject.title = editTitle
            } else {
              //如果某一级分类有children，继续去children里找
              if(subject.children) handleData(subject.children)
            }
            return subject
          })
        }
        // 1、获取当前编辑项的id + 用户的输入
        if (!editTitle.trim()) {
            message.error('分类名不能为空！',0.5)
            return
          }
        // 2、发请求更新数据
        await reqUpdateSubject(editId,editTitle)
        // 3、手动维护本地状态
        const updatedSubject1Arr = handleData(no1SubjectInfo.items)
          // 4、维护进状态
          this.setState(
            {
              no1SubjectInfo:{...no1SubjectInfo,items:updatedSubject1Arr},//更新分类信息
              editId:'',//清空编辑的id
              editTitle:''//清空编辑的title
            })
    }

    //  点击删除按钮的回调
    handleDelete = (subject) =>{
      const {pageNumber,pageSize,no1SubjectInfo} = this.state
     confirm({
     title: <h4>确认删除<span className="alert-info">{subject.title}</span>吗？</h4>,//主标题
      icon: <QuestionCircleOutlined />,//图标
      content: '删除后无法恢复，请谨慎操作！',//副标题
      okText: '确认',
      cancelText: '取消',
      onOk:async()=>{
        console.log('发送请求')
        await reqDeleteSubject(subject._id)
        this.getNo1SubjectPaging(
          pageNumber > 1 && no1SubjectInfo.items.length === 1 ?
          pageNumber-1 :
          pageNumber,pageSize

        )
        if (no1SubjectInfo.items.length === 1) this.setState({pageNumber:pageNumber-1})
      }
     })
    }


  render() {
    const {no1SubjectInfo,pageSize,pageNumber,expandedIds,loading,editId} = this.state
    // 表格中的数据源（这里设置的是假数据，之后会通过请求从服务器获取数据）
    let dataSource = no1SubjectInfo.items
    //  表格的列配置（根据设计文档写）
    const columns = [
      {
        title: '分类名',
        // dataIndex: 'title',//数据索引项————决定该列展示啥
        key: 'title',
        render:(item) =>  
          item._id === editId ? 
          <Input 
          defaultValue={item.title}
          onChange={event => this.setState({editTitle:event.target.value})}
          className="edit_input" 
          type="text"/> : 
          item.title
        
      },
      {
        title: '操作',
        width: '200px',
        align: 'center',
        // dataIndex: 'item',
        key: 'btn',
       
      //   (1) dataIndex和render同时存在：
      //          渲染结果的时候以render为准
      //          dataIndex所指定的属性，会作为参数传递给render
      //  (2)不写dataIndex，就会传递给render整个数据项
     // 高级动态操作
        render: (subject) => (
          subject._id === editId ?
          <Fragment>
            <Button 
              size="small" 
              type="primary" 
              className="left-btn"
              onClick={this.updateSubject}
              >确定</Button>
            <Button 
              size="small"
              onClick={()=> this.setState({editId:'',editTitle:''})}
             >取消</Button>
          </Fragment> :
          <Fragment>
            <Tooltip placement="top" title="编辑分类">
            <Button 
              type="primary" 
              onClick={()=> this.setState({editId:subject._id,editTitle:subject.title})} 
              className="left-btn"  
              icon={<FormOutlined />} 
            />
            </Tooltip>
            <Tooltip placement="top" title="删除分类">
            <Button 
              type="danger" 
              icon={<DeleteOutlined />} 
              onClick={()=>this.handleDelete(subject)}
            />
            </Tooltip>
          </Fragment>
        )
      }
    ];
    return (
      <Card 
        title={
          <Button 
            onClick={()=>this.props.history.push('/edu/subject/add')} 
            type="primary" 
            icon={<PlusOutlined />}
          >
            新增分类
          </Button>}
      >
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
          current:pageNumber,
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

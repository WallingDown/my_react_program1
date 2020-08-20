import React, { Component } from 'react'
import {Card,Button,Form,Input,Select, Divider} from 'antd'
import {ArrowLeftOutlined} from '@ant-design/icons'
import {reqNo1SubjectPaging,reqAddSubject} from '@/api/edu/subject'

const {Item} = Form
const {Option} = Select

export default class AddSubject extends Component {
    state = {
        no1SubjectInfo:{total:0,items:[]}
    }

    //根据页码、页大小请求数据
    getNo1SubjectPage = async(pageNumber=1,pageSize=5) =>{
        // 从状态中获取原数据
        const {no1SubjectInfo:{items:oldItems}} = this.state
        // 发送请求
        const result = await reqNo1SubjectPaging(pageNumber,pageSize)
        const {total,items} = result
        // 更新状态
        this.setState({
            no1SubjectInfo:{total,items:[...oldItems,...items]}
        })
    }
   
    componentDidMount() {
        this.pageNumber = 1
        //初始化Select框中数据
        this.getNo1SubjectPage(1,5)
    }

    // 表单提交的回调
    handleFinish = async(values) =>{
        // 发送添加分类请求
        await reqAddSubject(values)
        // 返回
        this.props.history.replace('/edu/subject/list')
    }

    // 点击加载更多按钮
    loadMore = () =>{
        this.pageNumber += 1
        this.getNo1SubjectPage(this.pageNumber,5)
    }

    render() {
        const {no1SubjectInfo} = this.state
        return (
            <Card title={
                    <>
                        <Button onClick={this.props.history.goBack} type="link" icon={<ArrowLeftOutlined />}></Button>
                        <span>添加分类</span>
                    </>
                }
            >
            
            <Form 
                onFinish={this.handleFinish} //点击提交按钮且表单验证通过后的回调
                wrapperCol={{span:5}} //调整wrapper区
                labelCol={{span:3}} //调整label区
                initialValues={{parentId:''}} // 设置表单项初始值
            >
                
                <Item
                    label="分类名"
                    /**
                     * Item中name属性的作用
                     * 1、作为antd收集表数数据时，数据对象中的key
                     * 2、让校验规则生效
                     */
                    name='title'//Item如果没有name属性，所有的rules不起作用
                    rules={[
                        {required:true,message:"抱歉！分类名是必填项"}
                    ]}

                >
                    <Input placeholder="请输入分类名"/>
                </Item>
                <Item
                    label="所属父级分类"
                    name="parentId"
                    rules={[
                        {required:true,message:"抱歉，必须选择一个所属分类"}
                    ]}
                >   
                    <Select
                        dropdownRender={(data)=>{
                            return (
                                <>
                                    {data}
                                    {
                                        no1SubjectInfo.total === no1SubjectInfo.items.length ?
                                        null:
                                        <div>
                                             <Divider style={{marginTop:2,marginBottom:2}}/>
                                             <Button type="link" onClick={this.loadMore}>加载更多...</Button>
                                        </div>
                                    }
                                </>
                            )
                        }}    
                    >
                        <Option key="0" value="">请选择分类</Option>
                        <Option key="1" value="0">一级分类</Option>
                        {
                           no1SubjectInfo.items.map(subject=>{
                            return <Option key={subject._id} value={subject._id}>{subject.title}</Option>
                            })
                        }
                        {/* <Option key="1" value="1">1</Option>
                        <Option key="2" value="2">2</Option>
                        <Option key="3" value="3">3</Option> */}
                    </Select>
                </Item>
                <Item wrapperCol={{offset:3}}>
                    <Button type="primary" htmlType="submit">确认</Button>
                </Item>
            </Form>
            </Card>
        )
    }
}

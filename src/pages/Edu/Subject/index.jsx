import React, { Component } from 'react'
import { Card, Button,Table } from 'antd'
import {PlusOutlined} from '@ant-design/icons'

export default class Subject extends Component {
    render() {
        // 表格中的数据源（这里设置的是假数据，之后会通过请求从服务器获取数据）
        const dataSource = [
            {
              _id: '1',//数据的唯一标识
              name: 'Html+css+javaScript',
              btn:'btn'
            },
            {
              _id: '2',
              name: 'React+antDesign',
              btn:'btn'
            },
          ];
        //  表格的列配置（根据设计文档写）
        const columns = [
            {
              title: '分类名',
              dataIndex: 'name',//数据索引项————决定该列展示啥
              key: '0',
            },
            {
              title: '操作',
              width:'200px',
              align:'center',
              dataIndex:'btn',
              key: '1',
            }
          ];
        return (
            <Card title={<Button type="primary"><PlusOutlined/>新增课程分类</Button>}>
                <Table dataSource={dataSource} columns={columns} rowKey="_id"/>
            </Card>
        )
    }
}

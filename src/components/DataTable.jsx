import React, { useState, useMemo } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  DatePicker,
  InputNumber,
  Space,
  Card,
  message
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined
} from '@ant-design/icons';
import { debounce } from 'lodash';
import dayjs from 'dayjs';

const DataTable = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [form] = Form.useForm();

  const [data, setData] = useState([
    {
      key: '1',
      name: 'Кедич Мирон',
      date: '2025-08-21',
      numericValue: 42,
    },
  ]);

  const filteredData = useMemo(() => {
    if (!searchText) return data;
    
    return data.filter(item =>
      Object.values(item).some(value =>
        value?.toString().toLowerCase().includes(searchText.toLowerCase())
      )
    );
  }, [data, searchText]);

  const columns = [
    {
      title: 'Имя',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: 'Дата',
      dataIndex: 'date',
      key: 'date',
      sorter: (a, b) => new Date(a.date) - new Date(b.date),
      render: (date) => dayjs(date).format('DD.MM.YYYY'),
    },
    {
      title: 'Числовое значение',
      dataIndex: 'numericValue',
      key: 'numericValue',
      sorter: (a, b) => a.numericValue - b.numericValue,
    },
    {
      title: 'Действия',
      key: 'actions',
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Редактировать
          </Button>
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.key)}
          >
            Удалить
          </Button>
        </Space>
      ),
    },
  ];

  const showModal = () => {
    setEditingRecord(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingRecord(record);
    form.setFieldsValue({
      ...record,
      date: record.date ? dayjs(record.date) : null,
    });
    setIsModalVisible(true);
  };

  const handleDelete = (key) => {
    setData(prev => prev.filter(item => item.key !== key));
    message.success('Запись удалена');
  };

  const handleOk = () => {
    form.validateFields().then(values => {
      const newRecord = {
        ...values,
        date: values.date ? values.date.format('YYYY-MM-DD') : null,
        key: editingRecord ? editingRecord.key : String(Date.now()),
      };

      if (editingRecord) {
        setData(prev => prev.map(item =>
          item.key === editingRecord.key ? newRecord : item
        ));
        message.success('Запись обновлена');
      } else {
        setData(prev => [...prev, newRecord]);
        message.success('Запись добавлена');
      }

      setIsModalVisible(false);
      form.resetFields();
    });
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  const handleSearch = debounce((value) => {
    setSearchText(value);
  }, 300);

  return (
    <div style={{ padding: '20px' }}>
      <Card>
        <div style={{ marginBottom: 16, display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={showModal}
          >
            Добавить
          </Button>
          
          <Input
            placeholder="Поиск по всем полям..."
            prefix={<SearchOutlined />}
            onChange={(e) => handleSearch(e.target.value)}
            style={{ width: 300 }}
            allowClear
          />
        </div>

        <Table
          columns={columns}
          dataSource={filteredData}
          pagination={{ pageSize: 5 }}
          scroll={{ x: true }}
        />

        <Modal
          title={editingRecord ? 'Редактировать запись' : 'Добавить запись'}
          open={isModalVisible}
          onOk={handleOk}
          onCancel={handleCancel}
          okText={editingRecord ? 'Обновить' : 'Добавить'}
          cancelText="Отмена"
        >
          <Form
            form={form}
            layout="vertical"
            initialValues={{
              name: '',
              date: null,
              numericValue: 0,
            }}
          >
            <Form.Item
              label="Имя"
              name="name"
              rules={[
                { required: true, message: 'Пожалуйста, введите имя' },
                { min: 2, message: 'Имя должно содержать минимум 2 символа' }
              ]}
            >
              <Input placeholder="Введите имя" />
            </Form.Item>

            <Form.Item
              label="Дата"
              name="date"
              rules={[{ required: true, message: 'Пожалуйста, выберите дату' }]}
            >
              <DatePicker
                style={{ width: '100%' }}
                format="DD.MM.YYYY"
                placeholder="Выберите дату"
              />
            </Form.Item>

            <Form.Item
              label="Числовое значение"
              name="numericValue"
              rules={[
                { required: true, message: 'Пожалуйста, введите числовое значение' },
                { type: 'number', min: 0, message: 'Значение должно быть положительным' }
              ]}
            >
              <InputNumber
                style={{ width: '100%' }}
                placeholder="Введите число"
                min={0}
              />
            </Form.Item>
          </Form>
        </Modal>
      </Card>
    </div>
  );
};

export default DataTable;
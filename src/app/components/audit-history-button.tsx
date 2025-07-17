"use client"

import { Button, Modal, Timeline, Avatar, Tooltip, Spin, Alert, Tag } from 'antd'
import { RightOutlined, UserOutlined, EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons'
import { useState } from 'react'
import { useClient } from '@/utils/supabase/client'
import { Database } from '@/utils/supabase/gen-types'
import { useQuery } from '@tanstack/react-query'

type AuditLog = Database['public']['Views']['audit_logs_view']['Row']

interface AuditHistoryButtonProps {
  recordId: number
  size?: 'small' | 'middle' | 'large'
}

export default function AuditHistoryButton({ recordId, size = 'small' }: AuditHistoryButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const supabase = useClient()

  const { data: auditLogs = [], isLoading: loading, error } = useQuery({
    queryKey: ['audit-logs', recordId],
    queryFn: async () => {
      const [collectionLogs, collectorLogs, tagLogs] = await Promise.all([
        supabase
          .from('audit_logs_view')
          .select('*')
          .eq('table_name', 'collection')
          .or(`changed_data->new->id.eq.${recordId},changed_data->data->id.eq.${recordId}`)
          .order('changed_at', { ascending: false }),
        
        supabase
          .from('audit_logs_view')
          .select('*')
          .eq('table_name', 'collector_to_collection')
          .or(`changed_data->new->collection_id.eq.${recordId},changed_data->data->collection_id.eq.${recordId}`)
          .order('changed_at', { ascending: false }),
          
        supabase
          .from('audit_logs_view')
          .select('*')
          .eq('table_name', 'tags_to_collection')
          .or(`changed_data->new->col_id.eq.${recordId},changed_data->data->col_id.eq.${recordId}`)
          .order('changed_at', { ascending: false })
      ])
      
      if (collectionLogs.error) throw collectionLogs.error
      if (collectorLogs.error) throw collectorLogs.error
      if (tagLogs.error) throw tagLogs.error
      
      const allLogs = [
        ...(collectionLogs.data || []),
        ...(collectorLogs.data || []),
        ...(tagLogs.data || [])
      ]
      
      return allLogs
        .filter(log => {
          // Включаем DELETE операции для связанных таблиц
          if (log.operation === 'DELETE' && (log.table_name === 'collector_to_collection' || log.table_name === 'tags_to_collection')) {
            return true
          }
          // Исключаем DELETE операции для основной таблицы collection
          return log.operation !== 'DELETE' || log.table_name !== 'collection'
        })
        .sort((a, b) => new Date(b.changed_at || 0).getTime() - new Date(a.changed_at || 0).getTime())
    },
    enabled: isModalOpen,
    staleTime: 0,
    gcTime: 0,
  })

  const getOperationIcon = (operation: string | null, tableName: string | null) => {
    switch (operation) {
      case 'UPDATE':
        return <EditOutlined style={{ color: '#1890ff' }} />
      case 'DELETE':
        if (tableName === 'collector_to_collection' || tableName === 'tags_to_collection') {
          return <EditOutlined style={{ color: '#1890ff' }} />
        }
        return <DeleteOutlined style={{ color: '#ff4d4f' }} />
      case 'INSERT':
        if (tableName === 'collector_to_collection' || tableName === 'tags_to_collection') {
          return <EditOutlined style={{ color: '#1890ff' }} />
        }
        return <PlusOutlined style={{ color: '#52c41a' }} />
      default:
        return <EditOutlined />
    }
  }

  const getOperationLabel = (operation: string | null, tableName: string | null) => {
    switch (operation) {
      case 'UPDATE':
        return 'Обновление'
      case 'DELETE':
        if (tableName === 'collector_to_collection' || tableName === 'tags_to_collection') {
          return 'Обновление'
        }
        return 'Удаление'
      case 'INSERT':
        if (tableName === 'collector_to_collection' || tableName === 'tags_to_collection') {
          return 'Обновление'
        }
        return 'Создание'
      default:
        return 'Изменение'
    }
  }

  const decodeWKBPoint = (wkbHex: string) => {
    try {
      if (!wkbHex || wkbHex.length < 42) {
        return 'Некорректные координаты'
      }
      
      const buffer = new ArrayBuffer(wkbHex.length / 2)
      const view = new DataView(buffer)
      
      for (let i = 0; i < wkbHex.length; i += 2) {
        view.setUint8(i / 2, parseInt(wkbHex.substring(i, i + 2), 16))
      }
      
      const endian = view.getUint8(0)
      const littleEndian = endian === 1
      
      // PostGIS EWKB format: смещение 9 байт для координат
      const x = view.getFloat64(9, littleEndian)  // longitude
      const y = view.getFloat64(17, littleEndian)  // latitude
      
      if (isNaN(x) || isNaN(y)) {
        return 'Некорректные координаты'
      }
      
      return `${y.toFixed(6)}, ${x.toFixed(6)}`
    } catch {
      return 'Ошибка декодирования координат'
    }
  }

  const { data: referenceData } = useQuery({
    queryKey: ['reference-data'],
    queryFn: async () => {
      const [regions, collectors, ages, sexes, kinds, genera, families, orders, institutes, tags] = await Promise.all([
        supabase.from('region').select('id, name, country:country_id(name)'),
        supabase.from('collector').select('id, first_name, last_name, second_name'),
        supabase.from('age').select('id, name'),
        supabase.from('sex').select('id, name'),
        supabase.from('kind').select('id, name, genus_id'),
        supabase.from('genus').select('id, name, family_id'),
        supabase.from('family').select('id, name, order_id'),
        supabase.from('order').select('id, name'),
        supabase.from('voucher_institute').select('id, name'),
        supabase.from('tags').select('id, name, color')
      ])
      
      // Create lookup maps for efficient taxonomy reconstruction
      const genusMap = new Map(genera.data?.map(g => [g.id, g]) || [])
      const familyMap = new Map(families.data?.map(f => [f.id, f]) || [])
      const orderMap = new Map(orders.data?.map(o => [o.id, o]) || [])
      
      // Reconstruct taxonomy hierarchy for kinds
      const kindsWithTaxonomy = kinds.data?.map(kind => {
        const genus = genusMap.get(kind.genus_id)
        const family = genus ? familyMap.get(genus.family_id) : null
        const order = family ? orderMap.get(family.order_id) : null
        
        return {
          ...kind,
          genus: genus ? { id: genus.id, name: genus.name } : null,
          family: family ? { id: family.id, name: family.name } : null,
          order: order ? { id: order.id, name: order.name } : null
        }
      }) || []
      
      return {
        regions: regions.data || [],
        collectors: collectors.data || [],
        ages: ages.data || [],
        sexes: sexes.data || [],
        kinds: kindsWithTaxonomy,
        institutes: institutes.data || [],
        tags: tags.data || []
      }
    },
    enabled: isModalOpen && auditLogs.length > 0,
  })

  const getFieldDisplayValue = (field: string, value: any) => {
    if (value === null || value === undefined) return 'Не указано'
    
    if (!referenceData) {
      return `ID: ${value}`
    }
    
    switch (field) {
      case 'region_id':
        const region = referenceData.regions.find(r => r.id === value)
        return region ? `${region.name} (${region.country?.name || 'Неизвестная страна'})` : `ID: ${value}`
      
      case 'age_id':
        const age = referenceData.ages.find(a => a.id === value)
        return age ? age.name : `ID: ${value}`
      
      case 'sex_id':
        const sex = referenceData.sexes.find(s => s.id === value)
        return sex ? sex.name : `ID: ${value}`
      
      case 'kind_id':
        const kind = referenceData.kinds.find(k => k.id === value)
        if (!kind) return `ID: ${value}`
        
        const parts = []
        if (kind.order?.name) parts.push(kind.order.name)
        if (kind.family?.name) parts.push(kind.family.name)
        if (kind.genus?.name) parts.push(kind.genus.name)
        if (kind.name) parts.push(kind.name)
        
        return parts.length > 0 ? parts.join('/') : kind.name
      
      case 'vouch_inst_id':
        const institute = referenceData.institutes.find(i => i.id === value)
        return institute ? institute.name : `ID: ${value}`
      
      case 'collector_id':
        const collector = referenceData.collectors.find(c => c.id === value)
        return collector ? `${collector.last_name} ${collector.first_name || ''} ${collector.second_name || ''}`.trim() : `ID: ${value}`
      
      case 'tag_id':
        const tag = referenceData.tags.find(t => t.id === value)
        return tag ? tag.name : `ID: ${value}`
      
      case 'point':
        return typeof value === 'string' ? decodeWKBPoint(value) : String(value)
      
      default:
        return String(value)
    }
  }

  const formatChangedData = (changedData: any, operation: string | null, tableName: string | null) => {
    if (!changedData || typeof changedData !== 'object') return 'Нет данных'
    
    if (operation === 'INSERT') {
      if (tableName === 'collector_to_collection') {
        const collectorId = changedData.new?.collector_id || changedData.data?.collector_id
        const displayValue = collectorId ? getFieldDisplayValue('collector_id', collectorId) : 'Неизвестный коллектор'
        return <div style={{ color: '#666', fontStyle: 'italic' }}>Добавлен коллектор: {displayValue}</div>
      } else if (tableName === 'tags_to_collection') {
        const tagId = changedData.new?.tag_id || changedData.data?.tag_id
        const displayValue = tagId ? getFieldDisplayValue('tag_id', tagId) : 'Неизвестный тег'
        return <div style={{ color: '#666', fontStyle: 'italic' }}>Добавлен тег: {displayValue}</div>
      }
      return <div style={{ color: '#666', fontStyle: 'italic' }}>Запись создана</div>
    }
    
    if (operation === 'DELETE') {
      if (tableName === 'collector_to_collection') {
        const collectorId = changedData.old?.collector_id || changedData.data?.collector_id
        const displayValue = collectorId ? getFieldDisplayValue('collector_id', collectorId) : 'Неизвестный коллектор'
        return <div style={{ color: '#666', fontStyle: 'italic' }}>Удален коллектор: {displayValue}</div>
      } else if (tableName === 'tags_to_collection') {
        const tagId = changedData.old?.tag_id || changedData.data?.tag_id
        const displayValue = tagId ? getFieldDisplayValue('tag_id', tagId) : 'Неизвестный тег'
        return <div style={{ color: '#666', fontStyle: 'italic' }}>Удален тег: {displayValue}</div>
      }
      return <div style={{ color: '#666', fontStyle: 'italic' }}>Запись удалена</div>
    }
    
    const { changed_fields, old: oldData } = changedData
    
    if (!changed_fields || typeof changed_fields !== 'object') return 'Нет данных'
    
    return Object.entries(changed_fields).map(([field, newValue]) => {
      const oldValue = oldData?.[field]
      const displayOldValue = getFieldDisplayValue(field, oldValue)
      const displayNewValue = getFieldDisplayValue(field, newValue)
      
      return (
        <div key={field} style={{ marginBottom: '8px' }}>
          <strong>{field}:</strong> {oldValue !== undefined ? `${displayOldValue} → ` : ''}{displayNewValue}
        </div>
      )
    })
  }

  const formatDateTime = (dateTime: string | null) => {
    if (!dateTime) return 'Неизвестно'
    
    try {
      return new Date(dateTime).toLocaleString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return 'Неизвестно'
    }
  }

  const getUserDisplayName = (userInfo: any) => {
    if (!userInfo) return 'Неизвестный пользователь'
    
    const { first_name, last_name } = userInfo
    return `${first_name || ''} ${last_name || ''}`.trim() || 'Неизвестный пользователь'
  }

  const getUserAvatar = (userInfo: any) => {
    if (!userInfo) return null
    
    const { avatar, first_name, last_name } = userInfo
    const fullName = `${first_name || ''} ${last_name || ''}`.trim()
    
    return (
      <Avatar
        src={avatar || undefined}
        size="small"
        icon={!avatar ? <UserOutlined /> : undefined}
      >
        {!avatar && fullName ? fullName.charAt(0).toUpperCase() : 'П'}
      </Avatar>
    )
  }

  const groupedLogs = auditLogs.reduce((acc, log) => {
    const isRelatedTableOperation = (log.operation === 'INSERT' || log.operation === 'DELETE') && 
      (log.table_name === 'collector_to_collection' || log.table_name === 'tags_to_collection')
    
    if (isRelatedTableOperation) {
      // Проверяем, можно ли группировать с предыдущим элементом
      const lastGroup = acc[acc.length - 1]
      if (lastGroup && lastGroup.type === 'group' && 
          lastGroup.user_info?.id === log.user_info?.id &&
          Math.abs(new Date(lastGroup.changed_at).getTime() - new Date(log.changed_at || 0).getTime()) < 60000) {
        // Добавляем в существующую группу (если разница во времени < 1 минуты)
        lastGroup.logs.push(log)
        return acc
      } else {
        // Создаем новую группу
        acc.push({
          type: 'group',
          user_info: log.user_info,
          changed_at: log.changed_at,
          logs: [log]
        })
      }
    } else {
      // Обычная запись
      acc.push({
        type: 'single',
        ...log
      })
    }
    return acc
  }, [] as any[])

  const timelineItems = groupedLogs.map((item) => ({
    dot: getUserAvatar(item.user_info),
    children: (
      <div>
        {item.type === 'group' ? (
          // Группа связанных операций
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <EditOutlined style={{ color: '#1890ff' }} />
              <strong>Обновление</strong>
              <span style={{ color: '#666' }}>от {getUserDisplayName(item.user_info)}</span>
            </div>
            <div style={{ color: '#666', fontSize: '12px', marginBottom: '8px' }}>
              {formatDateTime(item.changed_at)}
            </div>
            <div style={{ fontSize: '14px' }}>
              {(() => {
                // Группируем по типу таблицы
                const collectorLogs = item.logs.filter((log: any) => log.table_name === 'collector_to_collection')
                const tagLogs = item.logs.filter((log: any) => log.table_name === 'tags_to_collection')
                
                const result = []
                
                // Обработка коллекторов
                if (collectorLogs.length > 0) {
                  const addedCollectors = collectorLogs.filter((log: any) => log.operation === 'INSERT')
                  const removedCollectors = collectorLogs.filter((log: any) => log.operation === 'DELETE')
                  
                  const getCollectorInfo = (log: any) => {
                    const collectorId = log.changed_data.new?.collector_id || log.changed_data.old?.collector_id || log.changed_data.data?.collector_id
                    if (!collectorId || !referenceData) return null
                    
                    const collector = referenceData.collectors.find((c: any) => c.id === collectorId)
                    if (!collector) return null
                    
                    const surname = collector.last_name || ""
                    const firstInitial = collector.first_name ? collector.first_name.charAt(0) + "." : ""
                    const secondInitial = collector.second_name ? collector.second_name.charAt(0) + "." : ""
                    const displayName = `${surname} ${firstInitial}${secondInitial}`.trim()
                    
                    return { id: collectorId, name: displayName }
                  }
                  
                  const addedCollectorsList = addedCollectors.map(getCollectorInfo).filter(Boolean)
                  const removedCollectorsList = removedCollectors.map(getCollectorInfo).filter(Boolean)
                  
                  if (addedCollectorsList.length > 0 && removedCollectorsList.length > 0) {
                    // Есть и добавленные и удаленные - показываем "было -> стало"
                    result.push(
                      <div key="collectors" style={{ marginBottom: tagLogs.length > 0 ? '8px' : '0' }}>
                        <div style={{ marginBottom: '4px' }}>Коллекторы:</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                            {removedCollectorsList.map((collector: any) => (
                              <Tag key={`old-${collector.id}`} className="text-xs" style={{ textDecoration: 'line-through', opacity: 0.6 }}>
                                {collector.name}
                              </Tag>
                            ))}
                          </div>
                          <span style={{ color: '#666' }}>→</span>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                            {addedCollectorsList.map((collector: any) => (
                              <Tag key={`new-${collector.id}`} className="text-xs" style={{ backgroundColor: '#f6ffed', borderColor: '#b7eb8f' }}>
                                {collector.name}
                              </Tag>
                            ))}
                          </div>
                        </div>
                      </div>
                    )
                  } else if (addedCollectorsList.length > 0) {
                    // Только добавленные
                    result.push(
                      <div key="collectors" style={{ marginBottom: tagLogs.length > 0 ? '8px' : '0' }}>
                        <div style={{ marginBottom: '4px' }}>
                          {addedCollectorsList.length === 1 ? 'Добавлен коллектор:' : 'Добавлены коллекторы:'}
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                          {addedCollectorsList.map((collector: any) => (
                            <Tag key={collector.id} className="text-xs" style={{ backgroundColor: '#f6ffed', borderColor: '#b7eb8f' }}>
                              {collector.name}
                            </Tag>
                          ))}
                        </div>
                      </div>
                    )
                  } else if (removedCollectorsList.length > 0) {
                    // Только удаленные
                    result.push(
                      <div key="collectors" style={{ marginBottom: tagLogs.length > 0 ? '8px' : '0' }}>
                        <div style={{ marginBottom: '4px' }}>
                          {removedCollectorsList.length === 1 ? 'Удален коллектор:' : 'Удалены коллекторы:'}
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                          {removedCollectorsList.map((collector: any) => (
                            <Tag key={collector.id} className="text-xs" style={{ textDecoration: 'line-through', opacity: 0.6 }}>
                              {collector.name}
                            </Tag>
                          ))}
                        </div>
                      </div>
                    )
                  }
                }
                
                // Обработка тегов
                if (tagLogs.length > 0) {
                  const addedTags = tagLogs.filter((log: any) => log.operation === 'INSERT')
                  const removedTags = tagLogs.filter((log: any) => log.operation === 'DELETE')
                  
                  const getTagInfo = (log: any) => {
                    const tagId = log.changed_data.new?.tag_id || log.changed_data.old?.tag_id || log.changed_data.data?.tag_id
                    if (!tagId || !referenceData) return null
                    
                    const tag = referenceData.tags.find((t: any) => t.id === tagId)
                    return tag ? { id: tagId, name: tag.name, color: tag.color || 'blue' } : null
                  }
                  
                  const addedTagsList = addedTags.map(getTagInfo).filter(Boolean)
                  const removedTagsList = removedTags.map(getTagInfo).filter(Boolean)
                  
                  if (addedTagsList.length > 0 && removedTagsList.length > 0) {
                    // Есть и добавленные и удаленные - показываем "было -> стало"
                    result.push(
                      <div key="tags">
                        <div style={{ marginBottom: '4px' }}>Теги:</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                            {removedTagsList.map((tag: any) => (
                              <Tag key={`old-${tag.id}`} color={tag.color} style={{ textDecoration: 'line-through', opacity: 0.6 }}>
                                {tag.name}
                              </Tag>
                            ))}
                          </div>
                          <span style={{ color: '#666' }}>→</span>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                            {addedTagsList.map((tag: any) => (
                              <Tag key={`new-${tag.id}`} color={tag.color} style={{ boxShadow: '0 0 0 2px #b7eb8f' }}>
                                {tag.name}
                              </Tag>
                            ))}
                          </div>
                        </div>
                      </div>
                    )
                  } else if (addedTagsList.length > 0) {
                    // Только добавленные
                    result.push(
                      <div key="tags">
                        <div style={{ marginBottom: '4px' }}>
                          {addedTagsList.length === 1 ? 'Добавлен тег:' : 'Добавлены теги:'}
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                          {addedTagsList.map((tag: any) => (
                            <Tag key={tag.id} color={tag.color} style={{ boxShadow: '0 0 0 2px #b7eb8f' }}>
                              {tag.name}
                            </Tag>
                          ))}
                        </div>
                      </div>
                    )
                  } else if (removedTagsList.length > 0) {
                    // Только удаленные
                    result.push(
                      <div key="tags">
                        <div style={{ marginBottom: '4px' }}>
                          {removedTagsList.length === 1 ? 'Удален тег:' : 'Удалены теги:'}
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                          {removedTagsList.map((tag: any) => (
                            <Tag key={tag.id} color={tag.color} style={{ textDecoration: 'line-through', opacity: 0.6 }}>
                              {tag.name}
                            </Tag>
                          ))}
                        </div>
                      </div>
                    )
                  }
                }
                
                return result
              })()}
            </div>
          </div>
        ) : (
          // Обычная запись
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              {getOperationIcon(item.operation, item.table_name)}
              <strong>{getOperationLabel(item.operation, item.table_name)}</strong>
              <span style={{ color: '#666' }}>от {getUserDisplayName(item.user_info)}</span>
            </div>
            <div style={{ color: '#666', fontSize: '12px', marginBottom: '8px' }}>
              {formatDateTime(item.changed_at)}
            </div>
            <div style={{ fontSize: '14px' }}>
              {formatChangedData(item.changed_data, item.operation, item.table_name)}
            </div>
          </div>
        )}
      </div>
    )
  }))

  return (
    <>
      <Tooltip title="Показать историю изменений">
        <Button
          type="text"
          size={size}
          icon={<RightOutlined />}
          onClick={() => setIsModalOpen(true)}
          style={{ 
            padding: '0 4px',
            minWidth: 'auto',
            height: 'auto'
          }}
        />
      </Tooltip>
      
      <Modal
        title={`История изменений записи #${recordId}`}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        width={800}
      >
        {loading && (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <Spin size="large" />
          </div>
        )}
        
        {error && (
          <Alert
            message="Ошибка"
            description={error.message}
            type="error"
            showIcon
            style={{ marginBottom: '16px' }}
          />
        )}
        
        {!loading && !error && auditLogs.length === 0 && (
          <Alert
            message="Нет данных"
            description="История изменений для этой записи не найдена"
            type="info"
            showIcon
          />
        )}
        
        {!loading && !error && auditLogs.length > 0 && (
          <Timeline
            items={timelineItems}
            style={{ marginTop: '16px' }}
          />
        )}
      </Modal>
    </>
  )
}
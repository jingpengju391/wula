import { t } from 'i18next'
import React from 'react'

const CreateDrawerContent = (props: any) => {
  const addObject = () => {
    props.props.showModal(true)
  }

  return (
    <div className='createDrawerContent'>
      <span className="title">{t('addSendMember')}</span>
      <div className="addPeople" onClick={addObject}>
        <span className='tip'>{t('ClickAddMemberToReceiveMessage')}</span>
      </div>
      <span className="title">{t('EditContent')}</span>
      <textarea className="editContent" placeholder={t('PleaseEnterTheContent')}></textarea>
      <span className="btn">{t('OnekeySend')}</span>
    </div>
  )
}
export default CreateDrawerContent
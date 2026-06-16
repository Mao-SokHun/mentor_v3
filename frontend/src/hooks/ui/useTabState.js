import { useState } from 'react'

export const useTabState = (defaultTab = 0) => {
  const [activeTab, setActiveTab] = useState(defaultTab)
  return { activeTab, setActiveTab }
}

export default useTabState

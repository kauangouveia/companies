'use client';

import JsonView from '@uiw/react-json-view';
import { nordTheme } from '@uiw/react-json-view/nord';

interface WrapperProps {
  json: {};
  apiSearched: string;
}

export const Wrapper = ({ json, apiSearched }: WrapperProps) => {
  if (json === null) return <></>

  return (
    <div className="w-full h-full flex flex-col gap-8 items-center bg-white p-4">
      <div className="w-full md:w-[700px] min-h-28 p-6 bg-[#2E3440] rounded-xl shadow-lg">
        <span className="w-full flex items-center justify-between">
          <h3 className="text-lg font-bold">Resultado:</h3>
          <h3 className="text-lg font-bold">API: {apiSearched}</h3>
        </span>
        <JsonView value={json} style={nordTheme} />
      </div>
    </div>
  )
}
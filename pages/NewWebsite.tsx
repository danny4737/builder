import React from 'react';

const NewWebsite = () => {
  return (
    <div className="font-sans text-gray-900 antialiased bg-white dark:bg-slate-900 dark:text-white min-h-screen">
      
      {/* 히어로 섹션 (메인 타이틀) */}
      <div className="relative overflow-hidden pt-16 pb-32 space-y-24">
        <div className="relative">
          <div className="lg:mx-auto lg:max-w-7xl lg:px-8 lg:grid lg:grid-cols-2 lg:grid-flow-col-dense lg:gap-24">
            <div className="px-4 max-w-xl mx-auto sm:px-6 lg:py-32 lg:max-w-none lg:mx-0 lg:px-0 lg:col-start-2">
              <div>
                <div className="mt-6">
                  <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                    Google AI Studio로 만든 웹사이트
                  </h2>
                  <p className="mt-4 text-lg text-gray-500 dark:text-gray-300">
                    ㅜ
                  </p>
                  <div className="mt-6">
                    <button className="inline-flex px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700">
                      지금 시작하기
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-12 sm:mt-16 lg:mt-0 lg:col-start-1">
              <div className="pr-4 -ml-48 sm:pr-6 md:-ml-16 lg:px-0 lg:m-0 lg:relative lg:h-full">
                <img
                  className="w-full rounded-xl shadow-xl ring-1 ring-black ring-opacity-5 lg:absolute lg:right-0 lg:h-full lg:w-auto lg:max-w-none"
                  src="https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=2850&q=80"
                  alt="Customer profile user interface"
                />
              </div>
            </div>
          </div> 
        </div>
      </div>

      {/* 특징 소개 섹션 */}
      <div className="bg-gray-50 dark:bg-slate-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              주요 기능 소개
            </p>
          </div>

          <div className="mt-10">
            <div className="space-y-10 md:space-y-0 md:grid md:grid-cols-3 md:gap-x-8 md:gap-y-10">
              {[
                { title: '반응형 디자인', desc: '모바일, 태블릿, 데스크탑 어디서든 완벽하게 보입니다.' },
                { title: '다크 모드 지원', desc: '시스템 설정에 따라 자동으로 다크 모드가 적용됩니다.' },
                { title: '빠른 속도', desc: 'React의 장점을 살려 페이지 전환 없이 즉시 로딩됩니다.' },
              ].map((feature, index) => (
                <div key={index} className="relative p-6 bg-white dark:bg-slate-700 rounded-lg shadow">
                  <dt>
                    <p className="text-lg leading-6 font-medium text-gray-900 dark:text-white">{feature.title}</p>
                  </dt>
                  <dd className="mt-2 text-base text-gray-500 dark:text-gray-300">
                    {feature.desc}
                  </dd>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewWebsite;
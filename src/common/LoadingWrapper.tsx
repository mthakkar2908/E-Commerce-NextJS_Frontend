const LoadingWrapper = () => {
  return (
    <div className='fixed inset-0 flex items-center justify-center bg-neutral-950'>
      <div className='relative w-40 h-40'>
        <div className='absolute inset-0 rounded-full border border-orange-500/30 animate-ping' />
        <div className='absolute inset-6 rounded-full border border-orange-500/50 animate-ping delay-200' />
        <div className='absolute inset-12 rounded-full bg-orange-500 animate-pulse shadow-[0_0_40px_orange]' />
      </div>
    </div>
  );
};

export default LoadingWrapper;

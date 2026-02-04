import GamePhaseDisplay from './components/GamePhaseDisplay';

function App() {
  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl opacity-20" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-red-500/10 rounded-full blur-3xl opacity-20" />
      </div>

      <div className="relative z-10">
        <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8">
          <div className="max-w-2xl w-full space-y-12">
            <div className="text-center space-y-4 mb-12">
              <h1 className="text-5xl md:text-7xl font-black tracking-tighter">
                <span className="text-white">FIRST</span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-red-600 to-red-700">
                  STRIKE
                </span>
              </h1>
              <p className="text-lg md:text-xl text-cyan-400 italic font-light">
                The fastest click wins, Strike before the crowd.
              </p>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 via-red-500/20 to-blue-500/20 rounded-lg blur-xl" />
              <div className="relative bg-gray-950 border-2 border-cyan-500/50 hover:border-red-500/50 transition-colors rounded-lg p-8 backdrop-blur-sm">
                <GamePhaseDisplay />
              </div>
            </div>

            <div className="text-center text-xs text-gray-600 space-y-2">
              <p>Each cycle: 3h 30m countdown + 2m submission + 28m wait</p>
              <p>Times are synchronized globally for all participants</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;

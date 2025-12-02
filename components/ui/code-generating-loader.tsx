'use client'

export const CodeGeneratingLoader = () => {
  return (
    <div className="flex flex-col items-center justify-center gap-6 p-8">
      {/* Animated Orb */}
      <div className="loader-orb" />

      {/* Generating Text with Letter Animation */}
      <div className="flex items-center gap-2">
        <span className="code-loader-letter">g</span>
        <span className="code-loader-letter">e</span>
        <span className="code-loader-letter">n</span>
        <span className="code-loader-letter">e</span>
        <span className="code-loader-letter">r</span>
        <span className="code-loader-letter">a</span>
        <span className="code-loader-letter">t</span>
        <span className="code-loader-letter">i</span>
        <span className="code-loader-letter">n</span>
        <span className="code-loader-letter">g</span>
        <span className="code-loader-letter mx-2">c</span>
        <span className="code-loader-letter">o</span>
        <span className="code-loader-letter">d</span>
        <span className="code-loader-letter">e</span>
        <span className="code-loader-letter">.</span>
        <span className="code-loader-letter">.</span>
        <span className="code-loader-letter">.</span>
      </div>
    </div>
  )
}

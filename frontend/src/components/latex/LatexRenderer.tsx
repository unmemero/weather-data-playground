import React, { useMemo } from 'react';
import katex from 'katex';

interface LatexRendererProps {
  formula: string;
  displayMode?: boolean;
  className?: string;
}

export const LatexRenderer: React.FC<LatexRendererProps> = ({
  formula,
  displayMode = false,
  className = '',
}) => {
  const html = useMemo(() => {
    try {
      return katex.renderToString(formula, {
        displayMode,
        throwOnError: false,
        strict: false,
      });
    } catch (e: any) {
      return `<span class="text-rose-400 font-mono text-xs">${e.message || 'LaTeX Parse Error'}</span>`;
    }
  }, [formula, displayMode]);

  return (
    <span
      className={`inline-block ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
      data-testid="katex-render"
    />
  );
};

export default LatexRenderer;

// @sos-edit: false
import * as math from 'mathjs';

// Mapeamentos de caracteres de exibição para operadores que o mathjs entende
export const cleanExpression = (expr: string): string => {
  return expr
    .replace(/×/g, '*')
    .replace(/÷/g, '/')
    .replace(/−/g, '-')
    .replace(/π/g, 'pi')
    .replace(/e/g, 'e')
    // Substituir potências formatadas se houver, ex: x² ou x³ ou xʸ
    // Mas no display podemos salvar como ^2 ou ^3 ou ^
    .replace(/√\(/g, 'sqrt(')
    .replace(/∛\(/g, 'cbrt(');
};

export const evaluateExpression = (
  expression: string,
  variables: Record<string, string> = {},
  angleMode: 'DEG' | 'RAD' = 'RAD'
): string => {
  try {
    const cleaned = cleanExpression(expression);

    // Preparar escopo contendo as variáveis criadas pelo usuário (convertidas para números ou expressões se necessário)
    const scope: Record<string, any> = {};
    Object.entries(variables).forEach(([key, val]) => {
      // Se for um número válido, converte para número
      const num = Number(val);
      scope[key] = isNaN(num) ? val : num;
    });

    // Se o modo de ângulo for DEG (Graus), injetamos funções trigonométricas customizadas no escopo
    if (angleMode === 'DEG') {
      scope.sin = (x: number) => {
        // Se x for uma matriz ou array, a mathjs nativa trata, mas para simplificar tratamos como número
        // math.unit(x, 'deg') converte para radianos automaticamente ao passar para funções trigonométricas da mathjs
        return math.sin(math.unit(x, 'deg') as any);
      };
      scope.cos = (x: number) => math.cos(math.unit(x, 'deg') as any);
      scope.tan = (x: number) => math.tan(math.unit(x, 'deg') as any);
      
      // Funções trigonométricas inversas retornam radianos por padrão, convertemos para graus
      scope.asin = (x: number) => (math.asin(x) as number) * (180 / Math.PI);
      scope.acos = (x: number) => (math.acos(x) as number) * (180 / Math.PI);
      scope.atan = (x: number) => (math.atan(x) as number) * (180 / Math.PI);
    }

    const result = math.evaluate(cleaned, scope);

    if (result === undefined || result === null) {
      return '';
    }

    // Se for uma função em si (ex: usuário digitou apenas "sin")
    if (typeof result === 'function') {
      return 'Função';
    }

    // Se for um número complexo, matriz ou outro tipo do mathjs
    return formatResult(result);
  } catch (error: any) {
    console.error('Erro na avaliação da expressão:', error);
    return 'Erro';
  }
};

export const formatResult = (value: any): string => {
  if (value === null || value === undefined) return '';

  // Se o resultado for uma matriz/vetor
  if (value && typeof value === 'object' && 'toArray' in value) {
    return JSON.stringify(value.toArray());
  }

  if (typeof value === 'number') {
    if (isNaN(value)) return 'Erro';
    if (!isFinite(value)) return 'Infinito';

    // Se for muito grande ou muito pequeno, usar notação científica
    if (Math.abs(value) > 1e12 || (Math.abs(value) < 1e-6 && value !== 0)) {
      return value.toExponential(6);
    }

    // Arredondar para evitar imprecisões binárias (ex: 0.1 + 0.2 = 0.30000000000000004)
    // Usamos math.format que é muito robusto
    return math.format(value, { precision: 12 });
  }

  // Se for unidade ou fração ou complexo do mathjs
  return value.toString();
};

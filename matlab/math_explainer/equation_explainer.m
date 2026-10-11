function textExplanation = equation_explainer(equationType, matrices)
% EQUATION_EXPLAINER Translates math equations into intuitive engineering narratives
    switch equationType
        case 'CARE'
            textExplanation = 'The Continuous Algebraic Riccati Equation balances state tracking error against actuator control energy.';
        case 'Lyapunov'
            textExplanation = 'The Lyapunov matrix inequality proves energy decays asymptotically to zero over all time.';
        otherwise
            textExplanation = 'Standard dynamical state mapping.';
    end
    disp(textExplanation);
end

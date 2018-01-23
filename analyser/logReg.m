function [theta] = logReg(xtrain, ytrain)
  n = size(xtrain, 2) - 1;
  % Initialize fitting parameters
  initial_theta = zeros(n + 1, 1);

  %  Set options for fminunc
  options = optimset('GradObj', 'on', 'MaxIter', 400);

  %  Run fminunc to obtain the optimal theta
  %  This function will return theta and the cost
  [theta, cost] = ...
    fminunc(@(t)(costFunction(t, xtrain, ytrain)), ...
                                    initial_theta, options);

  fprintf('Cost at theta found by fminunc: %f\n', cost);
  %fprintf('Theta: \n');
  %fprintf(' %f \n', theta);

  fprintf('Writing theta to theta.csv\n\n');
  csvwrite('theta.csv', theta);

endfunction

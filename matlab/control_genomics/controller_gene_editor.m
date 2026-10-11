function editedDNA = controller_gene_editor(dna, targetGene, replacementValue)
% CONTROLLER_GENE_EDITOR Targeted CRISPR-style splicing of controller genes
    editedDNA = dna;
    editedDNA.Sequence = strrep(dna.Sequence, targetGene, replacementValue);
    disp(['Gene Spliced: Target [', targetGene, '] -> Replacement [', replacementValue, ']']);
end
